import { test, expect } from '@playwright/test';

test('system versioning compares any two versions and supports swapping orientation', async ({ page }) => {
  const response = await page.goto('/workspace/versioning', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'versioning workspace should respond successfully').toBeTruthy();

  await page.getByTestId('token-version-tag-id').fill('v1');
  await page.getByTestId('token-version-tag-label').fill('Initial');
  await page.getByTestId('token-version-tag-button').click();

  await page.getByTestId('token-version-fork-id').fill('v2');
  await page.getByTestId('token-version-fork-label').fill('Fork');
  await page.getByTestId('token-version-fork-button').click();

  await expect(page.getByTestId('token-version-compare-panel')).toBeVisible();
  await expect(page.getByTestId('token-version-compare-left')).toHaveValue('v2');
  await expect(page.getByTestId('token-version-compare-right')).toHaveValue('v1');
  await expect(page.getByTestId('token-version-compare-relationship')).toHaveText('descendant');

  await page.getByTestId('token-version-compare-swap').click();

  await expect(page.getByTestId('token-version-compare-left')).toHaveValue('v1');
  await expect(page.getByTestId('token-version-compare-right')).toHaveValue('v2');
  await expect(page.getByTestId('token-version-compare-relationship')).toHaveText('ancestor');
});
