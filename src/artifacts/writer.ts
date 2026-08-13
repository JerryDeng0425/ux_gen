import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { HtmlCaptureRecord, PageCapturePayload } from '../types.js';
import { captureFileName } from './naming.js';

async function atomicWrite(filePath: string, data: string): Promise<void> {
  const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(temporary, data, 'utf8');
    try {
      await rename(temporary, filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST' && (error as NodeJS.ErrnoException).code !== 'EPERM') throw error;
      const backup = `${filePath}.${process.pid}.${Date.now()}.previous`;
      try {
        await rename(filePath, backup);
        try {
          await rename(temporary, filePath);
          await rm(backup, { force: true });
        } catch (replaceError) {
          await rename(backup, filePath).catch(() => undefined);
          throw replaceError;
        }
      } finally {
        await rm(backup, { force: true }).catch(() => undefined);
      }
    }
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function injectCaptureMetadata(html: string, metadata: Record<string, string>, warnings: PageCapturePayload['warnings']): string {
  const nodes = Object.entries(metadata).map(([name, content]) =>
    `<meta name="${escapeAttribute(name)}" content="${escapeAttribute(content)}">`
  );
  for (const warning of warnings) nodes.push(`<meta name="spa-snapshot-warning" content="${escapeAttribute(`${warning.code}: ${warning.message}`)}">`);
  const block = `\n${nodes.join('\n')}\n`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${block}</head>`);
  return html.replace(/<html([^>]*)>/i, `<html$1><head>${block}</head>`);
}

export async function writeHtmlCapture(input: {
  outputDir?: string;
  runDir?: string;
  sessionId: string;
  captureIndex: number;
  label?: string;
  payload: PageCapturePayload;
}): Promise<HtmlCaptureRecord> {
  const { sessionId, captureIndex, label, payload } = input;
  const outputDir = input.outputDir ?? input.runDir;
  if (!outputDir) throw new Error('Capture output directory is required');
  if (payload.oversized || !payload.html) throw new Error('Snapshot is oversized; no HTML file was committed');
  await mkdir(outputDir, { recursive: true });
  const captureId = String(captureIndex).padStart(4, '0');
  const fileName = captureFileName(label, payload.title);
  const filePath = path.join(outputDir, fileName);
  const savedAt = new Date().toISOString();
  const html = injectCaptureMetadata(payload.html, {
    'spa-snapshot-session-id': sessionId,
    'spa-snapshot-capture-id': captureId,
    'spa-snapshot-saved-at': savedAt,
    'spa-snapshot-label': label ?? '',
    'spa-snapshot-route': payload.route,
    'spa-snapshot-title': payload.title,
    'spa-snapshot-viewport': `${payload.viewport.width}x${payload.viewport.height}`,
    'spa-snapshot-dpr': String(payload.dpr),
    'spa-snapshot-node-count': String(payload.nodeCount),
    'spa-snapshot-warning-count': String(payload.warnings.length)
  }, payload.warnings);
  await atomicWrite(filePath, html);
  return {
    captureId,
    label,
    fileName,
    filePath,
    requestedAt: payload.requestedAt,
    capturedAt: payload.capturedAt,
    savedAt,
    nodeCount: payload.nodeCount,
    htmlBytes: Buffer.byteLength(html, 'utf8'),
    warningCount: payload.warnings.length
  };
}
