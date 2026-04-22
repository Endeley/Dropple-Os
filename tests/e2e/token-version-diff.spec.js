import { test, expect } from '@playwright/test';

test('system versioning projects a stable diff between the active head and a selected version', async ({ page }) => {
  const response = await page.goto('/workspace/versioning', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'versioning workspace should respond successfully').toBeTruthy();
  await expect(page.getByTestId('token-version-diff-empty')).toBeVisible();

  await page.getByTestId('token-version-tag-id').fill('v1');
  await page.getByTestId('token-version-tag-label').fill('Initial');
  await page.getByTestId('token-version-tag-button').click();

  await page.getByTestId('token-version-fork-id').fill('v2');
  await page.getByTestId('token-version-fork-label').fill('Fork');
  await page.getByTestId('token-version-fork-button').click();

  await page.getByTestId('token-version-node-v1').click();

  await expect(page.getByTestId('token-version-diff-panel')).toBeVisible();
  await expect(page.getByTestId('token-version-diff-base')).toHaveText('v2');
  await expect(page.getByTestId('token-version-diff-compare')).toHaveText('v1');
  await expect(page.getByTestId('token-version-diff-breaking')).toHaveText('0');
  await expect(page.getByTestId('token-version-diff-additive')).toHaveText('0');
  await expect(page.getByTestId('token-version-diff-cosmetic')).toHaveText('0');
});
