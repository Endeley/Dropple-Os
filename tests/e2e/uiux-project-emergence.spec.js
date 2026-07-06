import { test, expect } from '@playwright/test';
import { expectSingleVisibleCanvasHost, visibleCanvasHost } from './helpers/canvasHost.js';

async function gotoNewWorkspace(page) {
  await page.goto('/workspace/new', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const keys = Object.keys(window.localStorage);
    for (const key of keys) {
      if (
        key === 'dropple.document.snapshot' ||
        key === 'dropple.activeDocument' ||
        key === 'dropple.documents' ||
        key.startsWith('dropple.document.')
      ) {
        window.localStorage.removeItem(key);
      }
    }
  });
  await page.goto('/workspace/new', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();
  await expectSingleVisibleCanvasHost(page);
}

async function activateTool(page, toolId) {
  const tool = page.locator(`[data-tool-id="${toolId}"]`).first();
  await tool.click();
  await expect(tool).toBeVisible();
}

async function dragCreateInsideNode(page, nodeLocator, { dx = 180, dy = 84 } = {}) {
  const box = await nodeLocator.boundingBox();
  if (!box) {
    throw new Error('Target node did not render');
  }

  const startX = box.x + Math.min(42, Math.max(24, box.width * 0.18));
  const startY = box.y + Math.min(42, Math.max(24, box.height * 0.18));
  const endX = Math.min(box.x + box.width - 24, startX + dx);
  const endY = Math.min(box.y + box.height - 24, startY + dy);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 8 });
  await page.mouse.up();
}

test('uiux project emergence reveals truthful containment when a child expression belongs inside the first page', async ({ page }) => {
  await gotoNewWorkspace(page);

  await page.getByTestId('uiux-empty-world-card-landingPage').click();
  await expect(page.getByTestId('uiux-first-expression')).toBeVisible();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const ids = state?.selection?.ids instanceof Set
          ? Array.from(state.selection.ids)
          : Array.isArray(state?.selection?.ids)
          ? state.selection.ids
          : [];
        return ids[0] ?? null;
      });
    })
    .toMatch(/^frame-/);
  const frameId = await page.evaluate(() => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const ids = state?.selection?.ids instanceof Set
      ? Array.from(state.selection.ids)
      : Array.isArray(state?.selection?.ids)
      ? state.selection.ids
      : [];
    return ids[0] ?? null;
  });
  expect(frameId).toMatch(/^frame-/);

  await page.getByTestId('uiux-first-expression-continue').click();
  await expect(page.getByTestId('uiux-first-expression')).toHaveCount(0);

  await activateTool(page, 'text');
  const frame = page.locator(`[data-node-id="${frameId}"]:visible`).first();
  await expect(frame).toBeVisible();
  await dragCreateInsideNode(page, frame);

  await expect
    .poll(async () => {
      return page.evaluate(({ parentId }) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const nodesById = state?.document?.sceneGraph?.nodes ?? {};
        const match = Object.values(nodesById).find((node) => node?.parentId === parentId && node?.type === 'text');
        return match?.id ?? null;
      }, { parentId: frameId });
    })
    .toBeTruthy();
  const childId = await page.evaluate(({ parentId }) => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const nodesById = state?.document?.sceneGraph?.nodes ?? {};
    const match = Object.values(nodesById).find((node) => node?.parentId === parentId && node?.type === 'text');
    return match?.id ?? null;
  }, { parentId: frameId });
  expect(childId).toBeTruthy();

  const child = page.locator(`[data-node-id="${childId}"]:visible`).first();
  await expect(child).toBeVisible();
  await child.click({ force: true });

  await expect(page.getByTestId('uiux-project-emergence')).toHaveAttribute('data-parent-node-id', frameId);
  await expect(page.getByTestId('uiux-project-emergence')).toHaveAttribute('data-child-node-id', childId);
  await expect(page.getByTestId('uiux-project-emergence-parent')).toBeVisible();
  await expect(page.getByTestId('uiux-project-emergence-child')).toBeVisible();

  const canvas = visibleCanvasHost(page);
  await expect(canvas).toBeVisible();
});
