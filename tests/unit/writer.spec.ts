import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { writeHtmlCapture } from '../../src/artifacts/writer.js';
import type { PageCapturePayload } from '../../src/types.js';

function payload(title: string, marker: string): PageCapturePayload {
  return {
    html: `<!doctype html><html><head><title>${title}</title></head><body>${marker}</body></html>`,
    doctype: '<!doctype html>', requestedAt: '2026-01-01T00:00:00.000Z', cloneStartedAt: '2026-01-01T00:00:00.000Z', capturedAt: '2026-01-01T00:00:00.000Z',
    originalUrl: 'https://example.test/', sanitizedUrl: 'https://example.test/', route: '/', title,
    nodeCount: 4, htmlBytes: 80, viewport: { width: 1440, height: 900 }, dpr: 1, scrollPositions: [],
    specialContent: { canvasTotal: 0, canvasSerialized: 0, canvasFailed: 0, iframeCount: 0, shadowRootCount: 0 },
    warnings: [], oversized: false
  };
}

test('overwrites the same page atomically and leaves no history', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'writer-overwrite-'));
  try {
    for (let index = 1; index <= 10; index += 1) {
      await writeHtmlCapture({ outputDir, sessionId: 'test', captureIndex: index, payload: payload('用户管理', `state-${index}`) });
    }
    const files = await readdir(outputDir);
    expect(files).toEqual(['用户管理.html']);
    expect(await readFile(path.join(outputDir, '用户管理.html'), 'utf8')).toContain('state-10');
  } finally { await rm(outputDir, { recursive: true, force: true }); }
});

test('explicit names create separate readable pages', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'writer-pages-'));
  try {
    await writeHtmlCapture({ outputDir, sessionId: 'test', captureIndex: 1, label: '订单列表', payload: payload('原标题', 'orders') });
    await writeHtmlCapture({ outputDir, sessionId: 'test', captureIndex: 2, label: '订单详情', payload: payload('原标题', 'detail') });
    expect((await readdir(outputDir)).sort()).toEqual(['订单列表.html', '订单详情.html'].sort());
  } finally { await rm(outputDir, { recursive: true, force: true }); }
});
