import { readFile } from 'node:fs/promises';
import path from 'node:path';

const indexPath = path.resolve(process.argv[2] ?? 'delivery/dist/index.html');
const html = await readFile(indexPath, 'utf8');
const externalReferences = [...html.matchAll(/<(?:script|link|img|source)\b[^>]*(?:src|href)=["'](https?:\/\/[^"']+)["']/gi)].map((match) => match[1]);
const externalModuleReferences = [...html.matchAll(/<script\b[^>]*\bsrc=["'][^"']+["']/gi)].map((match) => match[0]);
const externalStyles = [...html.matchAll(/<link\b[^>]*\bhref=["'][^"']+["']/gi)].map((match) => match[0]);
const forbidden = {
  serviceWorker: /serviceWorker\.register\s*\(/.test(html),
  absoluteDrive: /["'](?:[A-Za-z]:\\|file:\/\/\/[A-Za-z]:)/.test(html),
  rootResource: /(?:src|href)=["']\/(?!\/)/i.test(html),
  sourceMap: /sourceMappingURL=/.test(html)
};
const passed = externalReferences.length === 0
  && externalModuleReferences.length === 0
  && externalStyles.length === 0
  && Object.values(forbidden).every((value) => !value);
console.log(JSON.stringify({ indexPath, passed, externalReferences, externalModuleReferences, externalStyles, forbidden }, null, 2));
if (!passed) process.exitCode = 1;
