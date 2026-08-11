import { chromium, type Browser, type BrowserContext, type LaunchOptions } from 'playwright';

type PersistentContextOptions = NonNullable<Parameters<typeof chromium.launchPersistentContext>[1]>;

function isMissingBundledBrowser(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /executable doesn't exist|browser.*not found|playwright install/i.test(message);
}

export async function launchChromium(options: LaunchOptions = {}): Promise<Browser> {
  try {
    return await chromium.launch(options);
  } catch (error) {
    if (!isMissingBundledBrowser(error)) throw error;
    return chromium.launch({ ...options, channel: 'chrome' });
  }
}

export async function launchPersistentChromium(userDataDir: string, options: PersistentContextOptions = {}): Promise<BrowserContext> {
  try {
    return await chromium.launchPersistentContext(userDataDir, options);
  } catch (error) {
    if (!isMissingBundledBrowser(error)) throw error;
    return chromium.launchPersistentContext(userDataDir, { ...options, channel: 'chrome' });
  }
}
