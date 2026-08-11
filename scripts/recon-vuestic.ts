import { launchChromium } from '../src/browser/launch.js';

const browser = await launchChromium({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const reports = [];
  for (const route of ['/dashboard', '/users', '/projects', '/preferences', '/settings']) {
    await page.goto(`https://admin-demo.vuestic.dev${route}`, { waitUntil: 'networkidle', timeout: 60_000 });
    reports.push(await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      elementCount: document.querySelectorAll('*').length,
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).slice(0, 30).map((node) => node.textContent?.trim()).filter(Boolean),
      buttons: Array.from(document.querySelectorAll('button')).slice(0, 80).map((node) => ({ text: node.textContent?.trim().replace(/\s+/g, ' '), aria: node.getAttribute('aria-label'), title: node.getAttribute('title'), class: node.className })),
      fields: Array.from(document.querySelectorAll('input,textarea,select')).map((node) => ({ tag: node.tagName, type: node.getAttribute('type'), placeholder: node.getAttribute('placeholder'), aria: node.getAttribute('aria-label'), name: node.getAttribute('name'), id: node.id, class: node.className })),
      labels: Array.from(document.querySelectorAll('label')).map((node) => node.textContent?.trim().replace(/\s+/g, ' ')).filter(Boolean),
      tables: Array.from(document.querySelectorAll('table')).map((node) => ({ headers: Array.from(node.querySelectorAll('th')).map((header) => header.textContent?.trim()), firstRow: node.querySelector('tbody tr')?.textContent?.trim().replace(/\s+/g, ' ') })),
      dialogs: Array.from(document.querySelectorAll('[role=dialog],dialog,.va-modal')).map((node) => ({ tag: node.tagName, role: node.getAttribute('role'), class: node.className, text: node.textContent?.trim().replace(/\s+/g, ' ').slice(0, 300) }))
    })));
  }
  await page.goto('https://admin-demo.vuestic.dev/users', { waitUntil: 'networkidle', timeout: 60_000 });
  await page.getByPlaceholder('Search').fill('Test');
  await page.getByRole('button', { name: 'Edit user' }).first().click();
  await page.waitForTimeout(300);
  reports.push(await page.evaluate(() => ({
    url: location.href,
    state: 'users-edit-modal',
    bodyClass: document.body.className,
    fields: Array.from(document.querySelectorAll('input,textarea,select')).map((node) => ({ tag: node.tagName, type: node.getAttribute('type'), value: (node as HTMLInputElement).value, placeholder: node.getAttribute('placeholder'), aria: node.getAttribute('aria-label'), class: node.className })),
    buttons: Array.from(document.querySelectorAll('button')).map((node) => ({ text: node.textContent?.trim().replace(/\s+/g, ' '), aria: node.getAttribute('aria-label') })).filter((item) => item.text || item.aria),
    dialogs: Array.from(document.querySelectorAll('[role=dialog],dialog,.va-modal')).map((node) => ({ tag: node.tagName, role: node.getAttribute('role'), class: node.className, text: node.textContent?.trim().replace(/\s+/g, ' ').slice(0, 500) }))
  })));
  await page.goto('https://admin-demo.vuestic.dev/settings', { waitUntil: 'networkidle', timeout: 60_000 });
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  reports.push(await page.evaluate(() => ({
    url: location.href,
    state: 'settings-dark',
    htmlClass: document.documentElement.className,
    bodyClass: document.body.className,
    darkButtonClass: Array.from(document.querySelectorAll('button')).find((node) => node.textContent?.trim() === 'Dark')?.className,
    style: document.documentElement.getAttribute('style')
  })));
  console.log(JSON.stringify(reports, null, 2));
} finally {
  await browser.close();
}
