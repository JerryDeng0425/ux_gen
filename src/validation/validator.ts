import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import type { Browser } from 'playwright';
import { launchChromium } from '../browser/launch.js';
import type { HtmlValidationReport, HtmlValidationResult, ValidationIssue } from '../types.js';

async function findHtmlFiles(inputPath: string): Promise<string[]> {
  const info = await stat(inputPath);
  if (info.isFile()) return path.extname(inputPath).toLowerCase() === '.html' ? [inputPath] : [];
  if (!info.isDirectory()) return [];
  const files: string[] = [];
  for (const entry of await readdir(inputPath, { withFileTypes: true })) {
    const child = path.join(inputPath, entry.name);
    if (entry.isDirectory()) files.push(...await findHtmlFiles(child));
    else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.html') files.push(child);
  }
  return files.sort();
}

async function validateHtmlFile(browser: Browser, filePath: string): Promise<HtmlValidationResult> {
  const issues: ValidationIssue[] = [];
  let html = '';
  try {
    html = await readFile(filePath, 'utf8');
  } catch (error) {
    return { file: filePath, passed: false, issues: [{ severity: 'error', code: 'html_unreadable', message: String(error), file: filePath }] };
  }
  if (!/^<!doctype\s+html/i.test(html.trimStart())) issues.push({ severity: 'error', code: 'doctype_missing', message: 'HTML does not begin with an HTML doctype', file: filePath });
  if (!/<\/html>\s*$/i.test(html)) issues.push({ severity: 'error', code: 'html_truncated', message: 'HTML does not end with </html>', file: filePath });
  const context = await browser.newContext();
  await context.route('**/*', (route) => route.abort());
  const page = await context.newPage();
  try {
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const inspection = await page.evaluate(() => {
      const inlineEvents = Array.from(document.querySelectorAll('*')).flatMap((element) =>
        Array.from(element.attributes).filter((attribute) => attribute.name.toLowerCase().startsWith('on')).map((attribute) => `${element.tagName}.${attribute.name}`)
      );
      const javascriptUrls = Array.from(document.querySelectorAll('[href],[src],[action],[formaction]')).filter((element) =>
        Array.from(element.attributes).some((attribute) => /^\s*javascript:/i.test(attribute.value))
      ).length;
      const refresh = Array.from(document.querySelectorAll('meta[http-equiv]')).filter((element) => (element.getAttribute('http-equiv') ?? '').toLowerCase() === 'refresh').length;
      const requiredMeta = [
        'spa-snapshot-source',
        'spa-snapshot-requested-at',
        'spa-snapshot-captured-at',
        'spa-snapshot-session-id',
        'spa-snapshot-capture-id',
        'spa-snapshot-saved-at',
        'spa-snapshot-route',
        'spa-snapshot-title',
        'spa-snapshot-viewport',
        'spa-snapshot-dpr',
        'spa-snapshot-node-count',
        'spa-snapshot-warning-count'
      ];
      const missingMeta = requiredMeta.filter((name) => !document.querySelector(`meta[name="${name}"]`)?.getAttribute('content'));
      const warnings = Array.from(document.querySelectorAll('meta[name="spa-snapshot-warning"]')).map((meta) => meta.getAttribute('content') ?? 'capture warning');
      return {
        scripts: document.scripts.length,
        inlineEvents,
        javascriptUrls,
        refresh,
        missingMeta,
        warnings,
        toolHosts: document.querySelectorAll('[data-spa-snapshot-tool]').length
      };
    });
    if (inspection.scripts > 0) issues.push({ severity: 'error', code: 'script_present', message: `${inspection.scripts} script elements found`, file: filePath });
    if (inspection.inlineEvents.length > 0) issues.push({ severity: 'error', code: 'inline_event_present', message: `${inspection.inlineEvents.length} inline event handlers found`, file: filePath });
    if (inspection.javascriptUrls > 0) issues.push({ severity: 'error', code: 'javascript_url_present', message: `${inspection.javascriptUrls} javascript URLs found`, file: filePath });
    if (inspection.refresh > 0) issues.push({ severity: 'error', code: 'meta_refresh_present', message: 'Meta refresh found', file: filePath });
    if (inspection.missingMeta.length > 0) issues.push({ severity: 'error', code: 'metadata_missing', message: `Missing metadata: ${inspection.missingMeta.join(', ')}`, file: filePath });
    if (inspection.toolHosts > 0) issues.push({ severity: 'error', code: 'capture_control_present', message: 'Capture control leaked into saved DOM', file: filePath });
    for (const warning of inspection.warnings) issues.push({ severity: 'warning', code: 'capture_warning', message: warning, file: filePath });
  } catch (error) {
    issues.push({ severity: 'error', code: 'html_parse_failed', message: error instanceof Error ? error.message : String(error), file: filePath });
  } finally {
    await context.close();
  }
  return { file: filePath, passed: !issues.some((issue) => issue.severity === 'error'), issues };
}

export async function validateHtml(inputPath: string): Promise<HtmlValidationReport> {
  const absolutePath = path.resolve(inputPath);
  const files = await findHtmlFiles(absolutePath);
  if (files.length === 0) {
    return {
      validatedAt: new Date().toISOString(),
      path: absolutePath,
      passed: false,
      results: [{ file: absolutePath, passed: false, issues: [{ severity: 'error', code: 'html_missing', message: 'No HTML files found', file: absolutePath }] }]
    };
  }
  const browser = await launchChromium({ headless: true });
  try {
    const results: HtmlValidationResult[] = [];
    for (const file of files) results.push(await validateHtmlFile(browser, file));
    return {
      validatedAt: new Date().toISOString(),
      path: absolutePath,
      passed: results.every((result) => result.passed),
      results
    };
  } finally {
    await browser.close();
  }
}

export const validateRun = validateHtml;
