import { test, expect } from '@playwright/test';

async function gotoNewWorkspace(page) {
  await page.goto('/workspace/new', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();
  await expect(page.getByTestId('canvas-host')).toBeVisible();
}

async function activateTool(page, toolId) {
  const tool = page.locator(`[data-tool-id="${toolId}"]`).first();
  await tool.click();
  await expect(tool).toHaveClass(/is-active/);
}

async function dragOnCanvas(page, from, to) {
  const canvas = page.getByTestId('canvas-host');
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas host did not render');
  }

  await page.mouse.move(box.x + from.x, box.y + from.y);
  await page.mouse.down();
  await page.mouse.move(box.x + to.x, box.y + to.y, { steps: 8 });
  await page.mouse.up();
}

async function createFrame(page, from, to) {
  await page.locator('[data-tool-id="frame"]').click();
  await dragOnCanvas(page, from, to);
}

async function marqueeSelect(page, from, to) {
  await page.locator('[data-tool-id="select"]').click();
  await dragOnCanvas(page, from, to);
}

async function additiveMarqueeSelect(page, from, to) {
  await page.locator('[data-tool-id="select"]').click();
  await page.keyboard.down('Shift');
  await dragOnCanvas(page, from, to);
  await page.keyboard.up('Shift');
}

function captureMarqueeDebugLogs(page) {
  const logs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[MARQUEE DEBUG]')) {
      logs.push(text);
    }
  });
  return logs;
}

async function expectSelectionOutlineCount(page, expected, logs) {
  const count = await page.getByTestId('selection-outline').count();
  if (count !== expected) {
    console.log('Selection outline mismatch:', { expected, count, logs });
  }
  expect(count).toBe(expected);
}

async function marqueeRenderedNodes(page, locators, { additive = false, padding = 64 } = {}) {
  const canvas = page.getByTestId('canvas-host');
  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) {
    throw new Error('Canvas host did not render');
  }

  const boxes = (await Promise.all(locators.map((locator) => locator.boundingBox()))).filter(Boolean);
  if (boxes.length === 0) {
    throw new Error('No rendered node boxes available for marquee selection');
  }

  const left = Math.min(...boxes.map((box) => box.x)) - padding;
  const top = Math.min(...boxes.map((box) => box.y)) - padding;
  const right = Math.max(...boxes.map((box) => box.x + box.width)) + padding;
  const bottom = Math.max(...boxes.map((box) => box.y + box.height)) + padding;
  const startX = canvasBox.x + 16;
  const startY = canvasBox.y + 16;

  await activateTool(page, 'select');
  if (additive) {
    await page.keyboard.down('Shift');
  }

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(right, bottom, { steps: 8 });
  const marqueeVisible = await page.getByTestId('marquee-selection').isVisible().catch(() => false);
  if (!marqueeVisible) {
    console.log('Marquee overlay did not appear during drag', {
      startX,
      startY,
      right,
      bottom,
    });
  }
  await page.mouse.up();

  if (additive) {
    await page.keyboard.up('Shift');
  }
}

async function dragNode(page, locator, delta) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Target node did not render');
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + delta.x,
    box.y + box.height / 2 + delta.y,
    { steps: 10 }
  );
  await page.mouse.up();
}

async function dragResizeHandle(page, locator, delta) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Resize handle did not render');
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + delta.x,
    box.y + box.height / 2 + delta.y,
    { steps: 10 }
  );
  await page.mouse.up();
}

async function waitForMoved(locator, before, minimumDelta) {
  await expect
    .poll(async () => {
      const after = await locator.boundingBox();
      if (!after || !before) {
        return false;
      }

      const dx = Math.abs(after.x - before.x);
      const dy = Math.abs(after.y - before.y);
      return dx > minimumDelta.dx && dy > minimumDelta.dy;
    })
    .toBeTruthy();
}

async function waitForResized(locator, before, minimumDelta) {
  await expect
    .poll(async () => {
      const after = await locator.boundingBox();
      if (!after || !before) {
        return false;
      }

      const dw = (after.width ?? 0) - (before.width ?? 0);
      const dh = (after.height ?? 0) - (before.height ?? 0);
      return dw > minimumDelta.dw && dh > minimumDelta.dh;
    })
    .toBeTruthy();
}

test('workspace new can create and drag a single selected node', async ({ page }) => {
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });

  const node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();

  await activateTool(page, 'select');
  await node.click();
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);

  const before = await node.boundingBox();
  expect(before).not.toBeNull();

  await dragNode(page, node, { x: 90, y: 60 });
  await waitForMoved(node, before, { dx: 40, dy: 20 });
});

test('workspace new can multi-select and drag multiple nodes together', async ({ page }) => {
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 180, y: 180 }, { x: 320, y: 300 });
  await createFrame(page, { x: 420, y: 220 }, { x: 560, y: 340 });

  const nodes = page.locator('[data-node-id]');
  await expect(nodes).toHaveCount(2);

  const first = nodes.nth(0);
  const second = nodes.nth(1);

  await activateTool(page, 'select');
  await first.click();
  await page.keyboard.down('Shift');
  await second.click();
  await page.keyboard.up('Shift');

  await expect(page.getByTestId('selection-outline')).toHaveCount(2);

  const beforeFirst = await first.boundingBox();
  const beforeSecond = await second.boundingBox();
  expect(beforeFirst).not.toBeNull();
  expect(beforeSecond).not.toBeNull();

  await dragNode(page, second, { x: 80, y: 50 });
  await waitForMoved(first, beforeFirst, { dx: 30, dy: 15 });
  await waitForMoved(second, beforeSecond, { dx: 30, dy: 15 });
});

test('workspace new marquee-selects multiple nodes and keeps group drag authoritative', async ({ page }) => {
  const logs = captureMarqueeDebugLogs(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 180, y: 180 }, { x: 320, y: 300 });
  await createFrame(page, { x: 420, y: 220 }, { x: 560, y: 340 });

  const nodes = page.locator('[data-node-id]');
  await expect(nodes).toHaveCount(2);

  const first = nodes.nth(0);
  const second = nodes.nth(1);

  await marqueeRenderedNodes(page, [first, second]);
  await expectSelectionOutlineCount(page, 2, logs);

  const beforeFirst = await first.boundingBox();
  const beforeSecond = await second.boundingBox();
  expect(beforeFirst).not.toBeNull();
  expect(beforeSecond).not.toBeNull();

  await dragNode(page, first, { x: 70, y: 45 });
  await waitForMoved(first, beforeFirst, { dx: 25, dy: 15 });
  await waitForMoved(second, beforeSecond, { dx: 25, dy: 15 });
});

test('workspace new shift-marquee adds to the existing selection and preserves a primary outline', async ({ page }) => {
  const logs = captureMarqueeDebugLogs(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 140, y: 180 }, { x: 260, y: 300 });
  await createFrame(page, { x: 340, y: 180 }, { x: 460, y: 300 });
  await createFrame(page, { x: 540, y: 180 }, { x: 660, y: 300 });

  const nodes = page.locator('[data-node-id]');
  await expect(nodes).toHaveCount(3);

  const first = nodes.nth(0);
  const second = nodes.nth(1);
  const third = nodes.nth(2);

  await activateTool(page, 'select');
  await first.click();
  await expect(page.locator('[data-selection-primary="true"]')).toHaveCount(1);

  await marqueeRenderedNodes(page, [second, third], { additive: true });

  await expectSelectionOutlineCount(page, 3, logs);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveAttribute('data-selection-node-id', await first.getAttribute('data-node-id'));

  const beforeFirst = await first.boundingBox();
  const beforeSecond = await second.boundingBox();
  const beforeThird = await third.boundingBox();
  expect(beforeFirst).not.toBeNull();
  expect(beforeSecond).not.toBeNull();
  expect(beforeThird).not.toBeNull();

  await dragNode(page, third, { x: 60, y: 35 });
  await waitForMoved(first, beforeFirst, { dx: 20, dy: 10 });
  await waitForMoved(second, beforeSecond, { dx: 20, dy: 10 });
  await waitForMoved(third, beforeThird, { dx: 20, dy: 10 });
});

test('workspace new single-node resize updates bounds and persists', async ({ page }) => {
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });

  const node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();

  await activateTool(page, 'select');
  await node.click();

  const resizeHandle = page.getByTestId('resize-handle').first();
  await expect(resizeHandle).toBeVisible();

  const before = await node.boundingBox();
  expect(before).not.toBeNull();

  await dragResizeHandle(page, resizeHandle, { x: 60, y: 40 });
  await waitForResized(node, before, { dw: 20, dh: 15 });
});
