import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { type Browser, type Page } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { sha256 } from '../artifacts/hashes.js';
import { launchChromium } from '../browser/launch.js';
import type {
  ArtifactMetadata,
  AssertionConfig,
  KeypointValidationResult,
  RunSummary,
  ValidationIssue,
  ValidationReport
} from '../types.js';

async function validateAssertion(page: Page, assertion: AssertionConfig, sourceUrl: string): Promise<string | undefined> {
  if (assertion.type === 'url') return sourceUrl.includes(assertion.includes) ? undefined : `Source URL does not include ${assertion.includes}`;
  const locator = page.locator(assertion.selector).first();
  if (await locator.count() === 0) return `Missing selector ${assertion.selector}`;
  if (assertion.type === 'exists') return undefined;
  if (assertion.type === 'text') {
    const value = await locator.textContent();
    return value?.includes(assertion.includes) ? undefined : `${assertion.selector} text does not include ${assertion.includes}`;
  }
  if (assertion.type === 'attribute') {
    const value = await locator.getAttribute(assertion.name);
    return value === assertion.equals ? undefined : `${assertion.selector}[${assertion.name}] expected ${assertion.equals}, got ${value}`;
  }
  if (assertion.type === 'value') {
    const value = await locator.inputValue();
    return value === assertion.equals ? undefined : `${assertion.selector} value expected ${assertion.equals}, got ${value}`;
  }
  const value = await locator.isChecked();
  return value === assertion.equals ? undefined : `${assertion.selector} checked expected ${assertion.equals}, got ${value}`;
}

async function compareScreenshots(page: Page, reference: Buffer, maskSelectors: string[]): Promise<number | undefined> {
  const replay = await page.screenshot({
    type: 'png',
    animations: 'disabled',
    mask: maskSelectors.map((selector) => page.locator(selector))
  });
  const expected = PNG.sync.read(reference);
  const actual = PNG.sync.read(replay);
  if (expected.width !== actual.width || expected.height !== actual.height) return undefined;
  const differingPixels = pixelmatch(expected.data, actual.data, undefined, expected.width, expected.height, { threshold: 0.15 });
  return differingPixels / (expected.width * expected.height);
}

async function validateKeypoint(browser: Browser, runDir: string, metadataName: string, visual: boolean): Promise<KeypointValidationResult> {
  const issues: ValidationIssue[] = [];
  let metadata: ArtifactMetadata;
  try {
    metadata = JSON.parse(await readFile(path.join(runDir, metadataName), 'utf8')) as ArtifactMetadata;
  } catch (error) {
    return { keypointId: metadataName, passed: false, issues: [{ severity: 'error', code: 'metadata_invalid', message: String(error), file: metadataName }] };
  }
  const htmlPath = path.join(runDir, metadata.files.html);
  const screenshotPath = path.join(runDir, metadata.files.screenshot);
  let html: string;
  let screenshot: Buffer;
  try {
    [html, screenshot] = await Promise.all([readFile(htmlPath, 'utf8'), readFile(screenshotPath)]);
  } catch (error) {
    return { keypointId: metadata.keypointId, passed: false, issues: [{ severity: 'error', code: 'artifact_missing', message: String(error) }] };
  }

  if (sha256(html) !== metadata.hashes.htmlSha256) issues.push({ severity: 'error', code: 'html_hash_mismatch', message: 'HTML SHA-256 does not match metadata' });
  if (sha256(screenshot) !== metadata.hashes.screenshotSha256) issues.push({ severity: 'error', code: 'screenshot_hash_mismatch', message: 'Screenshot SHA-256 does not match metadata' });
  if (!/^<!doctype\s+html/i.test(html.trimStart())) issues.push({ severity: 'error', code: 'doctype_missing', message: 'HTML does not begin with an HTML doctype' });
  if (!/<\/html>\s*$/i.test(html)) issues.push({ severity: 'error', code: 'html_truncated', message: 'HTML does not end with </html>' });

  const context = await browser.newContext({ viewport: metadata.viewport });
  await context.route('**/*', (route) => route.abort());
  const page = await context.newPage();
  try {
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const security = await page.evaluate(() => {
      const inlineEvents = Array.from(document.querySelectorAll('*')).flatMap((element) =>
        Array.from(element.attributes).filter((attribute) => attribute.name.toLowerCase().startsWith('on')).map((attribute) => `${element.tagName}.${attribute.name}`)
      );
      const javascriptUrls = Array.from(document.querySelectorAll('[href],[src],[action],[formaction]')).filter((element) =>
        Array.from(element.attributes).some((attribute) => /^\s*javascript:/i.test(attribute.value))
      ).length;
      const refresh = Array.from(document.querySelectorAll('meta[http-equiv]')).filter((element) => (element.getAttribute('http-equiv') ?? '').toLowerCase() === 'refresh').length;
      const leakedPasswords = Array.from(document.querySelectorAll('input[type=password]')).filter((element) => (element.getAttribute('value') ?? '') !== '').length;
      const leakedFiles = Array.from(document.querySelectorAll('input[type=file]')).filter((element) => element.hasAttribute('value')).length;
      return { scripts: document.scripts.length, inlineEvents, javascriptUrls, refresh, leakedPasswords, leakedFiles };
    });
    if (security.scripts > 0) issues.push({ severity: 'error', code: 'script_present', message: `${security.scripts} script elements found` });
    if (security.inlineEvents.length > 0) issues.push({ severity: 'error', code: 'inline_event_present', message: `${security.inlineEvents.length} inline event handlers found` });
    if (security.javascriptUrls > 0) issues.push({ severity: 'error', code: 'javascript_url_present', message: `${security.javascriptUrls} javascript URLs found` });
    if (security.refresh > 0) issues.push({ severity: 'error', code: 'meta_refresh_present', message: 'Meta refresh found' });
    if (security.leakedPasswords > 0 || security.leakedFiles > 0) issues.push({ severity: 'error', code: 'sensitive_input_value', message: 'Password or file input value leaked' });
    if (/(?:[A-Za-z]:\\Users\\|\/home\/[^/]+\/)/i.test(html)) issues.push({ severity: 'error', code: 'local_path_leak', message: 'Possible local user path found' });
    if (/[?&](?:token|code|key|secret|password|auth|session)=(?!%5BREDACTED%5D|\[REDACTED\])/i.test(html)) issues.push({ severity: 'error', code: 'sensitive_query_leak', message: 'Sensitive query parameter value found' });

    for (const assertion of metadata.assertions) {
      const failure = await validateAssertion(page, assertion, metadata.route ?? metadata.sanitizedUrl);
      if (failure) issues.push({ severity: 'error', code: 'assertion_failed', message: failure });
    }
    for (const warning of metadata.warnings) issues.push({ severity: 'warning', code: warning.code, message: warning.message });
    if (visual) {
      await context.unroute('**/*');
      await page.setContent(html, { waitUntil: 'networkidle', timeout: 30_000 });
      const ratio = await compareScreenshots(page, screenshot, metadata.maskSelectors);
      if (ratio === undefined) issues.push({ severity: 'warning', code: 'visual_size_mismatch', message: 'Replay screenshot dimensions differ from reference' });
      else if (ratio > 0.05) issues.push({ severity: 'error', code: 'visual_diff', message: `Visual difference ${(ratio * 100).toFixed(2)}% exceeds 5%` });
      return { keypointId: metadata.keypointId, passed: !issues.some((issue) => issue.severity === 'error'), issues, visualDiffRatio: ratio };
    }
  } catch (error) {
    issues.push({ severity: 'error', code: 'html_parse_failed', message: error instanceof Error ? error.message : String(error) });
  } finally {
    await context.close();
  }
  return { keypointId: metadata.keypointId, passed: !issues.some((issue) => issue.severity === 'error'), issues };
}

export async function validateRun(runDirInput: string, options: { visual?: boolean; writeReport?: boolean } = {}): Promise<ValidationReport> {
  const runDir = path.resolve(runDirInput);
  const summary = JSON.parse(await readFile(path.join(runDir, 'run-summary.json'), 'utf8')) as RunSummary;
  const browser = await launchChromium({ headless: true });
  try {
    const results: KeypointValidationResult[] = [];
    for (const record of summary.keypoints) {
      if (!record.artifactMetadata) {
        if (record.status !== 'skipped') results.push({ keypointId: record.id, passed: false, issues: [{ severity: 'error', code: 'artifact_reference_missing', message: `No metadata for ${record.status} keypoint` }] });
        continue;
      }
      results.push(await validateKeypoint(browser, runDir, record.artifactMetadata, options.visual ?? false));
    }
    const report: ValidationReport = {
      runId: summary.runId,
      validatedAt: new Date().toISOString(),
      passed: results.length > 0 && results.every((result) => result.passed),
      results
    };
    if (options.writeReport !== false) await writeFile(path.join(runDir, 'validation-report.json'), `${JSON.stringify(report, null, 2)}\n`);
    return report;
  } finally {
    await browser.close();
  }
}
