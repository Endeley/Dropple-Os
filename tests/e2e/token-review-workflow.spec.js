import { test, expect } from '@playwright/test';

test('system versioning submits a resolved merge review and supports approve and request changes decisions', async ({ page }) => {
  const response = await page.goto('/workspace/versioning', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'versioning workspace should respond successfully').toBeTruthy();

  await page.getByTestId('token-version-token-path').fill('color.primary');
  await page.getByTestId('token-version-token-value').fill('#111111');
  await page.getByTestId('token-version-token-set-button').click();

  await page.getByTestId('token-version-tag-id').fill('v1');
  await page.getByTestId('token-version-tag-button').click();

  await page.getByTestId('token-version-token-value').fill('#222222');
  await page.getByTestId('token-version-token-set-button').click();
  await page.getByTestId('token-version-fork-id').fill('v2');
  await page.getByTestId('token-version-fork-button').click();

  await page.getByTestId('token-version-node-v1').click();
  await page.getByTestId('token-version-rollback-button').click();

  await page.getByTestId('token-version-token-value').fill('#333333');
  await page.getByTestId('token-version-token-set-button').click();
  await page.getByTestId('token-version-fork-id').fill('v3');
  await page.getByTestId('token-version-fork-button').click();

  await page.getByTestId('token-version-node-v2').click();
  await page.getByTestId('token-conflict-keep-left-color-primary').click();
  await page.getByTestId('token-conflict-apply-version-id').fill('v4');
  await page.getByTestId('token-conflict-apply-button').click();

  await expect(page.getByTestId('token-review-panel')).toBeVisible();
  await expect(page.getByTestId('token-review-selected-id')).toHaveText('review-v4');
  await expect(page.getByTestId('token-review-selected-status')).toHaveText('pending');

  await page.getByTestId('token-review-reviewer-id').fill('qa');
  await page.getByTestId('token-review-decision-note').fill('needs another look');
  await page.getByTestId('token-review-request-changes-button').click();
  await expect(page.getByTestId('token-review-selected-status')).toHaveText('changes_requested');
  await expect(page.getByTestId('token-review-changes-count')).toHaveText('1');

  await page.getByTestId('token-review-decision-note').fill('looks good now');
  await page.getByTestId('token-review-approve-button').click();
  await expect(page.getByTestId('token-review-selected-status')).toHaveText('approved');
  await expect(page.getByTestId('token-review-approved-count')).toHaveText('1');
});
