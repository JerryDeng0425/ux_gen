import type { SnapshotRunner } from '../runner.js';

export async function executeVuesticFlow(runner: SnapshotRunner): Promise<void> {
  await runner.page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor({ state: 'visible' });
  await runner.capture('K01');

  await runner.page.locator('a[aria-label="Visit Users"]').click();
  await runner.page.getByPlaceholder('Search').fill('Test');
  await runner.page.getByRole('columnheader', { name: /Full Name/ }).click();
  await runner.capture('K02');

  await runner.page.getByRole('button', { name: 'Edit user' }).first().click();
  const dialog = runner.page.getByRole('dialog').filter({ hasText: 'Edit user' });
  await dialog.waitFor({ state: 'visible' });
  await dialog.locator('input[type="text"]').first().fill('Snapshot User');
  await dialog.locator('textarea').fill('unsaved snapshot draft');
  await runner.capture('K03');

  await runner.page.keyboard.press('Escape');
  const confirmation = runner.page.getByRole('dialog').filter({ hasText: 'Form has unsaved changes' });
  await confirmation.getByRole('button', { name: 'OK' }).click();
  await dialog.waitFor({ state: 'hidden' });
  await runner.page.locator('a[aria-label="Visit Application settings"]').click();
  await runner.page.getByRole('button', { name: 'Dark', exact: true }).click();
  const firstSwitch = runner.page.locator('.va-switch__input').first();
  if (!await firstSwitch.isChecked()) await firstSwitch.check({ force: true });
  await runner.capture('K04');
}
