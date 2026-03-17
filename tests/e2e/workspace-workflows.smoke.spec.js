import { test, expect } from '@playwright/test';

function attachErrorTracking(page) {
  const errors = [];
  const consoleErrors = [];

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  return { errors, consoleErrors };
}

function assertNoFatalErrors({ errors, consoleErrors }, label) {
  expect(errors, `${label} should not trigger pageerror`).toEqual([]);
  expect(
    consoleErrors.filter((message) => !message.includes('Unchecked runtime.lastError')),
    `${label} should not log browser console errors`
  ).toEqual([]);
}

test('marketplace template workflow opens template details and enters workspace', async ({ page }) => {
  const tracked = attachErrorTracking(page);

  const response = await page.goto('/marketplace', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'marketplace route should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Templates');
  await page.getByText('Landing Page Starter').click();

  await expect(page).toHaveURL(/\/marketplace\/template\/tpl-landing-001$/);
  await expect(page.locator('body')).toContainText('Landing Page Starter');

  await page.getByRole('button', { name: 'Buy Personal License' }).click();
  await expect(page.getByRole('button', { name: 'Use Template' })).toBeEnabled();

  await page.getByRole('button', { name: 'Use Template' }).click();
  await expect(page).toHaveURL(/\/workspace\/new\?fromTemplate=tpl-landing-001$/);
  await expect(page.locator('body')).toContainText('Undo');

  assertNoFatalErrors(tracked, 'marketplace template workflow');
});

test('workspace mode flow can move between graphic and media routes without fatal errors', async ({ page }) => {
  const tracked = attachErrorTracking(page);

  let response = await page.goto('/workspace/graphic', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'graphic workspace should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Undo');

  response = await page.goto('/workspace/media', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'media workspace should respond successfully').toBeTruthy();
  await expect(page.locator('body')).toContainText('Media Workspace');
  await expect(page.locator('body')).not.toContainText('Application error');
  await expect(page.locator('body')).not.toContainText('Module not found');

  assertNoFatalErrors(tracked, 'workspace mode flow');
});
