import { test, expect } from '@playwright/test';

test('system versioning shows a merge preview for a selected merge candidate', async ({ page }) => {
  const response = await page.goto('/workspace/versioning', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'versioning workspace should respond successfully').toBeTruthy();
  await expect(page.getByTestId('token-merge-preview-empty')).toBeVisible();

  await page.getByTestId('token-version-tag-id').fill('v1');
  await page.getByTestId('token-version-tag-label').fill('Initial');
  await page.getByTestId('token-version-tag-button').click();

  await page.getByTestId('token-version-fork-id').fill('v2');
  await page.getByTestId('token-version-fork-label').fill('Fork');
  await page.getByTestId('token-version-fork-button').click();

  await page.getByTestId('token-version-node-v1').click();

  await expect(page.getByTestId('token-merge-preview-panel')).toBeVisible();
  await expect(page.getByTestId('token-merge-preview-left')).toHaveText('v2');
  await expect(page.getByTestId('token-merge-preview-right')).toHaveText('v1');
  await expect(page.getByTestId('token-merge-preview-ancestor')).toHaveText('v1');
  await expect(page.getByTestId('token-merge-preview-conflicts')).toHaveText('0');
});
