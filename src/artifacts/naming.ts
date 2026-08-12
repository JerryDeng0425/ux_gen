const WINDOWS_RESERVED = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;

export function safePageName(value: string | undefined): string {
  let name = (value ?? '').normalize('NFC').trim();
  name = name.replace(/\.html?$/i, '');
  name = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .replace(/[. ]+$/g, '')
    .replace(/^[. -]+/g, '');
  if (!name) name = 'untitled';
  if (WINDOWS_RESERVED.test(name)) name = `_${name}`;
  const characters = Array.from(name);
  if (characters.length > 100) name = characters.slice(0, 100).join('').replace(/[. ]+$/g, '');
  return name || 'untitled';
}

export function captureFileName(explicitName: string | undefined, pageTitle: string): string {
  return `${safePageName(explicitName?.trim() || pageTitle)}.html`;
}

/** @deprecated v2 alias kept for source compatibility during migration. */
export const safeSlug = safePageName;
