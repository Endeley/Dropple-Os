import { test, expect } from '@playwright/test';

test('system versioning resolves a sibling branch value conflict before allowing apply', async ({ page }) => {
  const response = await page.goto('/workspace/versioning', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'versioning workspace should respond successfully').toBeTruthy();

  await page.getByTestId('token-version-token-path').fill('color.primary');
  await page.getByTestId('token-version-token-value').fill('#111111');
  await page.getByTestId('token-version-token-set-button').click();

  await page.getByTestId('token-version-tag-id').fill('v1');
  await page.getByTestId('token-version-tag-label').fill('Initial');
  await page.getByTestId('token-version-tag-button').click();

  await page.getByTestId('token-version-token-value').fill('#222222');
  await page.getByTestId('token-version-token-set-button').click();

  await page.getByTestId('token-version-fork-id').fill('v2');
  await page.getByTestId('token-version-fork-label').fill('Left branch');
  await page.getByTestId('token-version-fork-button').click();

  await page.getByTestId('token-version-node-v1').click();
  await page.getByTestId('token-version-rollback-button').click();

  await page.getByTestId('token-version-token-value').fill('#333333');
  await page.getByTestId('token-version-token-set-button').click();

  await page.getByTestId('token-version-fork-id').fill('v3');
  await page.getByTestId('token-version-fork-label').fill('Right branch');
  await page.getByTestId('token-version-fork-button').click();

  await page.getByTestId('token-version-node-v2').click();

  await expect(page.getByTestId('token-conflict-resolution-panel')).toBeVisible();
  await expect(page.getByTestId('token-conflict-unresolved-count')).toHaveText('1');
  await expect(page.getByTestId('token-conflict-apply-button')).toBeDisabled();

  await page.getByTestId('token-conflict-keep-left-color-primary').click();
  await expect(page.getByTestId('token-conflict-unresolved-count')).toHaveText('0');

  await page.getByTestId('token-conflict-apply-version-id').fill('v4');
  await page.getByTestId('token-conflict-apply-label').fill('Resolved merge proposal');
  await page.getByTestId('token-conflict-apply-button').click();

  await expect(page.getByTestId('token-conflict-proposal-status')).toContainText('Submitted review proposal');
  await expect(page.getByTestId('token-review-panel')).toBeVisible();
  await expect(page.getByTestId('token-review-pending-count')).toHaveText('1');
  await expect(page.getByTestId('token-review-selected-status')).toHaveText('pending');
  await expect(page.getByTestId('token-version-active-head')).toHaveText('v3');
});
