import { expect } from '@playwright/test';

export function visibleCanvasHost(page) {
  return page.getByTestId('canvas-host').filter({ visible: true }).first();
}

export async function expectSingleVisibleCanvasHost(page) {
  const visibleHosts = page.getByTestId('canvas-host').filter({ visible: true });
  await expect(visibleHosts).toHaveCount(1);
  await expect(visibleHosts.first()).toBeVisible();
}
