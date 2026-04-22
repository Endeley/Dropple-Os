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

test('system versioning can tag, fork, merge, rollback, and update projected head state', async ({ page }) => {
  const tracked = attachErrorTracking(page);

  const response = await page.goto('/workspace/versioning', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'versioning workspace should respond successfully').toBeTruthy();
  await expect(page.getByTestId('token-version-head-ribbon')).toBeVisible();
  await expect(page.getByTestId('token-version-active-head')).toHaveText('none');

  await page.getByTestId('token-version-tag-id').fill('v1');
  await page.getByTestId('token-version-tag-label').fill('Initial');
  await page.getByTestId('token-version-tag-button').click();

  await expect(page.getByTestId('token-version-active-head')).toHaveText('v1');
  await expect(page.getByTestId('token-version-node-v1')).toBeVisible();
  await expect(page.getByTestId('token-version-inspector-id')).toHaveText('v1');

  await page.getByTestId('token-version-fork-id').fill('v2');
  await page.getByTestId('token-version-fork-label').fill('Fork');
  await page.getByTestId('token-version-fork-button').click();

  await expect(page.getByTestId('token-version-active-head')).toHaveText('v2');
  await expect(page.getByTestId('token-version-node-v2')).toBeVisible();

  await page.getByTestId('token-version-node-v1').click();
  await expect(page.getByTestId('token-version-inspector-id')).toHaveText('v1');

  await page.getByTestId('token-version-merge-id').fill('v3');
  await page.getByTestId('token-version-merge-label').fill('Merge');
  await page.getByTestId('token-version-merge-button').click();

  await expect(page.getByTestId('token-version-active-head')).toHaveText('v3');
  await expect(page.getByTestId('token-version-node-v3')).toBeVisible();

  await page.getByTestId('token-version-node-v1').click();
  await page.getByTestId('token-version-rollback-button').click();

  await expect(page.getByTestId('token-version-active-head')).toHaveText('v1');

  assertNoFatalErrors(tracked, 'token versioning workflow');
});
