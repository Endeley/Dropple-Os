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

  const margin = 12;
  const minX = box.x + margin;
  const minY = box.y + margin;
  const maxX = box.x + box.width - margin;
  const maxY = box.y + box.height - margin;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  let startX = clamp(box.x + from.x, minX, maxX);
  let startY = clamp(box.y + from.y, minY, maxY);
  let endX = clamp(box.x + to.x, minX, maxX);
  let endY = clamp(box.y + to.y, minY, maxY);

  // Ensure create-gesture has enough distance even on smaller canvases.
  // Runtime create commit requires world-space width/height > 6.
  // Keep a large pixel delta so high zoom levels still exceed threshold.
  const minDelta = 96;
  if (Math.abs(endX - startX) < minDelta) {
    endX = clamp(startX + minDelta, minX, maxX);
  }
  if (Math.abs(endY - startY) < minDelta) {
    endY = clamp(startY + minDelta, minY, maxY);
  }

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 8 });
  await page.mouse.up();
}

async function createFrame(page, from, to) {
  const nodes = page.locator('[data-node-id]');
  const beforeCount = await nodes.count();
  const sessionDebugSamples = [];
  const retryOffsets = [
    { x: 0, y: 0 },
    { x: 36, y: 36 },
    { x: 96, y: 0 },
    { x: 0, y: 96 },
    { x: 160, y: 36 },
  ];

  const tryCreate = async (start, end) => {
    await activateTool(page, 'frame');
    await page.waitForTimeout(50);
    const canvas = page.getByTestId('canvas-host');
    const box = await canvas.boundingBox();
    if (!box) {
      throw new Error('Canvas host did not render');
    }

    const startX = box.x + start.x;
    const startY = box.y + start.y;
    const startHitsNode = await page.evaluate(
      ({ x, y }) => {
        const hit = document.elementFromPoint(x, y);
        return Boolean(hit?.closest?.('[data-node-id]'));
      },
      { x: startX, y: startY }
    );

    // Create-node sessions only start when pointer-down lands on empty canvas.
    if (startHitsNode) {
      return false;
    }

    await dragOnCanvas(
      page,
      start,
      end
    );

    const createSessionDebug = await page.evaluate(() => {
      return document.documentElement.dataset.droppleCreateSessionDebug || null;
    });
    sessionDebugSamples.push({
      start,
      end,
      createSessionDebug,
    });
    expect(createSessionDebug, 'create session should report a commit outcome').toBeTruthy();
    expect(
      createSessionDebug,
      `create session commit outcome must not be pointer mismatch: ${createSessionDebug}`
    ).not.toContain('pointer-mismatch');

    const created = await expect
      .poll(async () => await nodes.count(), {
        timeout: 2500,
      })
      .toBeGreaterThan(beforeCount)
      .then(() => true)
      .catch(() => false);

    if (created) {
      return true;
    }

    return false;
  };

  for (const offset of retryOffsets) {
    const created = await tryCreate(
      { x: from.x + offset.x, y: from.y + offset.y },
      { x: to.x + offset.x, y: to.y + offset.y }
    );
    if (created) return;
  }

  // Fallback: scan deterministic empty zones across the canvas so we don't rely
  // on fixed coordinates that can become occupied after prior frame creation.
  const scanStarts = [
    { x: 64, y: 64 },
    { x: 240, y: 64 },
    { x: 420, y: 64 },
    { x: 64, y: 240 },
    { x: 240, y: 240 },
    { x: 420, y: 240 },
    { x: 64, y: 420 },
    { x: 240, y: 420 },
  ];
  for (const start of scanStarts) {
    const created = await tryCreate(
      start,
      { x: start.x + 140, y: start.y + 110 }
    );
    if (created) return;
  }

  const overlayDebug = await page.evaluate(() => document.documentElement.dataset.droppleOverlayDebug || null);
  throw new Error(
    `Frame creation did not increase node count from ${beforeCount}; overlay=${overlayDebug}; createSessionSamples=${JSON.stringify(sessionDebugSamples)}`
  );
}

async function waitForNodeCount(page, expectedCount) {
  const nodes = page.locator('[data-node-id]');
  await expect
    .poll(async () => await nodes.count(), {
      timeout: 10000,
    })
    .toBe(expectedCount);

  await expect(nodes).toHaveCount(expectedCount);
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

async function waitForNudged(locator, before, minimumDeltaX) {
  await expect
    .poll(async () => {
      const after = await locator.boundingBox();
      if (!after || !before) {
        return null;
      }
      return after.x - before.x;
    })
    .toBeGreaterThan(minimumDeltaX);
}

async function readCanonicalLayoutX(page, nodeId) {
  return page.evaluate((id) => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    return state?.document?.layout?.nodes?.[id]?.x ?? null;
  }, nodeId);
}

async function readInteractionProjectionX(page, nodeId) {
  return page.evaluate((id) => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    return state?.interaction?.drag?.interactionTransforms?.[id]?.x ?? null;
  }, nodeId);
}

async function readNormalizedInteractionEndHash(page) {
  return page.evaluate(() => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const ids = Object.keys(state?.document?.layout?.nodes ?? {}).sort();
    const firstId = ids[0] ?? null;
    const layout = firstId ? state.document.layout.nodes[firstId] : null;
    const payload = {
      nodeCount: ids.length,
      firstNode: layout
        ? {
            x: layout.x ?? null,
            y: layout.y ?? null,
            width: layout.width ?? null,
            height: layout.height ?? null,
          }
        : null,
      dragActive: Boolean(state?.interaction?.drag?.active),
      selectedCount:
        state?.selection?.ids instanceof Set
          ? state.selection.ids.size
          : Array.isArray(state?.selection?.ids)
          ? state.selection.ids.length
          : 0,
    };
    return JSON.stringify(payload);
  });
}

function attachRuntimeErrorCollectors(page) {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => {
    pageErrors.push(String(error?.message ?? error));
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  return { pageErrors, consoleErrors };
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

  await createFrame(page, { x: 140, y: 180 }, { x: 280, y: 300 });
  await createFrame(page, { x: 320, y: 220 }, { x: 460, y: 340 });

  const nodes = page.locator('[data-node-id]');
  await waitForNodeCount(page, 2);

  const first = nodes.nth(0);
  const second = nodes.nth(1);

  await activateTool(page, 'select');
  await first.click({ force: true });
  await page.keyboard.down('Shift');
  await second.click({ force: true });
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

  await createFrame(page, { x: 140, y: 180 }, { x: 280, y: 300 });
  await createFrame(page, { x: 320, y: 220 }, { x: 460, y: 340 });

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
  await waitForNodeCount(page, 3);

  const first = nodes.nth(0);
  const second = nodes.nth(1);
  const third = nodes.nth(2);

  await activateTool(page, 'select');
  await first.click({ force: true });
  await expect(page.locator('[data-selection-primary="true"]')).toHaveCount(1);
  const primaryBeforeAdditive = await page
    .locator('[data-selection-primary="true"]')
    .getAttribute('data-selection-node-id');
  expect(primaryBeforeAdditive).toBeTruthy();

  await marqueeRenderedNodes(page, [second, third], { additive: true });

  await expectSelectionOutlineCount(page, 3, logs);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveAttribute(
    'data-selection-node-id',
    primaryBeforeAdditive
  );

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

test('workspace new deterministic create-select-drag-resize roundtrip preserves selection identity', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();

  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);

  const selectedNodeId = await node.getAttribute('data-node-id');
  expect(selectedNodeId).toBeTruthy();

  const selectionPrimary = page.locator('[data-selection-primary="true"]');
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', selectedNodeId);

  const beforeDrag = await node.boundingBox();
  expect(beforeDrag).not.toBeNull();
  await dragNode(page, node, { x: 90, y: 60 });
  await waitForMoved(node, beforeDrag, { dx: 40, dy: 20 });

  const resizeHandle = page.getByTestId('resize-handle').first();
  await expect(resizeHandle).toBeVisible();
  const beforeResize = await node.boundingBox();
  expect(beforeResize).not.toBeNull();
  await dragResizeHandle(page, resizeHandle, { x: 60, y: 40 });
  await waitForResized(node, beforeResize, { dw: 20, dh: 15 });

  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', selectedNodeId);

  const after = await node.boundingBox();
  expect(after).not.toBeNull();
  expect(after.x).not.toBe(beforeDrag.x);
  expect(after.y).not.toBe(beforeDrag.y);
  expect(after.width).toBeGreaterThan(beforeResize.width);
  expect(after.height).toBeGreaterThan(beforeResize.height);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudge and shift-nudge move selected node with preserved identity', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();

  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);

  const selectedNodeId = await node.getAttribute('data-node-id');
  expect(selectedNodeId).toBeTruthy();

  const selectionPrimary = page.locator('[data-selection-primary="true"]');
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', selectedNodeId);

  const beforeNudge = await node.boundingBox();
  expect(beforeNudge).not.toBeNull();
  const beforeLayoutX = await readCanonicalLayoutX(page, selectedNodeId);
  expect(typeof beforeLayoutX).toBe('number');
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(async () => {
      const nextX = await readCanonicalLayoutX(page, selectedNodeId);
      if (typeof nextX !== 'number') return null;
      return nextX - beforeLayoutX;
    })
    .toBeGreaterThan(0);

  const afterNudge = await node.boundingBox();
  expect(afterNudge).not.toBeNull();
  const afterNudgeLayoutX = await readCanonicalLayoutX(page, selectedNodeId);
  const nudgeDx = afterNudgeLayoutX - beforeLayoutX;
  expect(nudgeDx).toBeGreaterThan(0);

  await page.keyboard.press('Shift+ArrowRight');
  await expect
    .poll(async () => {
      const afterShiftNudgeLayoutX = await readCanonicalLayoutX(page, selectedNodeId);
      if (typeof afterShiftNudgeLayoutX !== 'number') return null;
      return afterShiftNudgeLayoutX - afterNudgeLayoutX;
    })
    .toBeGreaterThan(nudgeDx);

  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', selectedNodeId);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudge commits canonical layout and remains replay-stable with no projection residue', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  const runFlow = async () => {
    await gotoNewWorkspace(page);
    await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
    const node = page.locator('[data-node-id]').first();
    await expect(node).toBeVisible();
    await activateTool(page, 'select');
    await node.click({ force: true });
    await expect(page.getByTestId('selection-outline')).toHaveCount(1);
    const selectedNodeId = await node.getAttribute('data-node-id');
    expect(selectedNodeId).toBeTruthy();

    const beforeLayoutX = await readCanonicalLayoutX(page, selectedNodeId);
    expect(typeof beforeLayoutX).toBe('number');

    await page.keyboard.press('ArrowRight');
    await expect
      .poll(async () => {
        const layoutX = await readCanonicalLayoutX(page, selectedNodeId);
        return typeof layoutX === 'number' ? layoutX - beforeLayoutX : null;
      })
      .toBeGreaterThan(0);
    expect(await readInteractionProjectionX(page, selectedNodeId)).toBe(null);

    return readNormalizedInteractionEndHash(page);
  };

  const hashA = await runFlow();
  await page.reload({ waitUntil: 'networkidle' });
  const hashB = await runFlow();
  expect(hashB).toBe(hashA);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudge applies symmetric canonical deltas across all arrow directions', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();

  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  const selectedNodeId = await node.getAttribute('data-node-id');
  expect(selectedNodeId).toBeTruthy();

  const readCanonicalLayout = async () =>
    page.evaluate((id) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const layout = state?.document?.layout?.nodes?.[id] ?? null;
      if (!layout) return null;
      return { x: layout.x ?? null, y: layout.y ?? null };
    }, selectedNodeId);

  const start = await readCanonicalLayout();
  expect(start).toBeTruthy();
  expect(typeof start.x).toBe('number');
  expect(typeof start.y).toBe('number');

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await expect
    .poll(async () => {
      const layout = await readCanonicalLayout();
      if (!layout) return null;
      return layout.x - start.x;
    })
    .toBe(0);

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowUp');
  await expect
    .poll(async () => {
      const layout = await readCanonicalLayout();
      if (!layout) return null;
      return layout.y - start.y;
    })
    .toBe(0);

  await page.keyboard.press('ArrowLeft');
  await expect
    .poll(async () => {
      const layout = await readCanonicalLayout();
      if (!layout) return null;
      return layout.x - start.x;
    })
    .toBeLessThan(0);

  await page.keyboard.press('ArrowUp');
  await expect
    .poll(async () => {
      const layout = await readCanonicalLayout();
      if (!layout) return null;
      return layout.y - start.y;
    })
    .toBeLessThan(0);

  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveAttribute(
    'data-selection-node-id',
    selectedNodeId
  );

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudge quantization preserves base/shift/alt canonical step ordering', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();

  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  const selectedNodeId = await node.getAttribute('data-node-id');
  expect(selectedNodeId).toBeTruthy();

  const selectionPrimary = page.locator('[data-selection-primary="true"]');
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', selectedNodeId);

  const readLayoutX = async () => await readCanonicalLayoutX(page, selectedNodeId);

  const startX = await readLayoutX();
  expect(typeof startX).toBe('number');

  await page.keyboard.press('ArrowRight');
  const afterBaseX = await readLayoutX();
  expect(typeof afterBaseX).toBe('number');
  const baseStep = afterBaseX - startX;
  expect(baseStep).toBeGreaterThan(0);

  await page.keyboard.press('Shift+ArrowRight');
  const afterShiftX = await readLayoutX();
  expect(typeof afterShiftX).toBe('number');
  const shiftStep = afterShiftX - afterBaseX;
  expect(shiftStep).toBeGreaterThan(baseStep);

  await page.keyboard.press('Alt+ArrowRight');
  const afterAltX = await readLayoutX();
  expect(typeof afterAltX).toBe('number');
  const altStep = afterAltX - afterShiftX;
  expect(altStep).toBeGreaterThan(0);
  expect(altStep).toBeLessThan(baseStep);

  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', selectedNodeId);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudge Y-axis quantization preserves base/shift/alt ordering and upward symmetry', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();

  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  const selectedNodeId = await node.getAttribute('data-node-id');
  expect(selectedNodeId).toBeTruthy();

  const selectionPrimary = page.locator('[data-selection-primary="true"]');
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', selectedNodeId);

  const readLayoutY = async () =>
    page.evaluate((id) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      return state?.document?.layout?.nodes?.[id]?.y ?? null;
    }, selectedNodeId);

  const startY = await readLayoutY();
  expect(typeof startY).toBe('number');

  await page.keyboard.press('ArrowDown');
  const afterBaseDownY = await readLayoutY();
  expect(typeof afterBaseDownY).toBe('number');
  const baseDownStep = afterBaseDownY - startY;
  expect(baseDownStep).toBeGreaterThan(0);

  await page.keyboard.press('Shift+ArrowDown');
  const afterShiftDownY = await readLayoutY();
  expect(typeof afterShiftDownY).toBe('number');
  const shiftDownStep = afterShiftDownY - afterBaseDownY;
  expect(shiftDownStep).toBeGreaterThan(baseDownStep);

  await page.keyboard.press('Alt+ArrowDown');
  const afterAltDownY = await readLayoutY();
  expect(typeof afterAltDownY).toBe('number');
  const altDownStep = afterAltDownY - afterShiftDownY;
  expect(altDownStep).toBeGreaterThan(0);
  expect(altDownStep).toBeLessThan(baseDownStep);

  const downEndY = afterAltDownY;
  await page.keyboard.press('ArrowUp');
  const afterBaseUpY = await readLayoutY();
  expect(typeof afterBaseUpY).toBe('number');
  const baseUpStep = downEndY - afterBaseUpY;
  expect(baseUpStep).toBeGreaterThan(0);
  expect(baseUpStep).toBe(baseDownStep);

  await page.keyboard.press('Shift+ArrowUp');
  const afterShiftUpY = await readLayoutY();
  expect(typeof afterShiftUpY).toBe('number');
  const shiftUpStep = afterBaseUpY - afterShiftUpY;
  expect(shiftUpStep).toBeGreaterThan(baseUpStep);
  expect(shiftUpStep).toBe(shiftDownStep);

  await page.keyboard.press('Alt+ArrowUp');
  const afterAltUpY = await readLayoutY();
  expect(typeof afterAltUpY).toBe('number');
  const altUpStep = afterShiftUpY - afterAltUpY;
  expect(altUpStep).toBeGreaterThan(0);
  expect(altUpStep).toBeLessThan(baseUpStep);
  expect(altUpStep).toBe(altDownStep);

  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', selectedNodeId);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudge is inert with no selection and while focus is in input or contenteditable', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();
  const selectedNodeId = await node.getAttribute('data-node-id');
  expect(selectedNodeId).toBeTruthy();

  const readLayout = async () =>
    page.evaluate((id) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const layout = state?.document?.layout?.nodes?.[id] ?? null;
      if (!layout) return null;
      return { x: layout.x ?? null, y: layout.y ?? null };
    }, selectedNodeId);

  // No selection: nudge must be inert.
  const noSelectionStart = await readLayout();
  expect(noSelectionStart).toBeTruthy();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  const noSelectionEnd = await readLayout();
  expect(noSelectionEnd).toEqual(noSelectionStart);

  // With selection established.
  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  const selectedStart = await readLayout();
  expect(selectedStart).toBeTruthy();

  // Input focus: nudge must be inert.
  await page.evaluate(() => {
    const input = document.createElement('input');
    input.id = 'dropple-test-input-nudge-guard';
    input.value = 'focus-guard';
    document.body.appendChild(input);
    input.focus();
  });
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  const afterInputFocus = await readLayout();
  expect(afterInputFocus).toEqual(selectedStart);

  // Contenteditable focus: nudge must be inert.
  await page.evaluate(() => {
    const editable = document.createElement('div');
    editable.id = 'dropple-test-contenteditable-nudge-guard';
    editable.contentEditable = 'true';
    editable.textContent = 'editable-guard';
    document.body.appendChild(editable);
    editable.focus();
  });
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  const afterContentEditableFocus = await readLayout();
  expect(afterContentEditableFocus).toEqual(selectedStart);

  await page.evaluate(() => {
    document.getElementById('dropple-test-input-nudge-guard')?.remove();
    document.getElementById('dropple-test-contenteditable-nudge-guard')?.remove();
  });

  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveAttribute(
    'data-selection-node-id',
    selectedNodeId
  );

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudges preserve finite positive canonical layout bounds under repeated movement', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();

  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  const selectedNodeId = await node.getAttribute('data-node-id');
  expect(selectedNodeId).toBeTruthy();

  const readLayout = async () =>
    page.evaluate((id) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const layout = state?.document?.layout?.nodes?.[id] ?? null;
      if (!layout) return null;
      return {
        x: layout.x ?? null,
        y: layout.y ?? null,
        width: layout.width ?? null,
        height: layout.height ?? null,
      };
    }, selectedNodeId);

  const assertFinitePositiveLayout = (layout) => {
    expect(layout).toBeTruthy();
    expect(Number.isFinite(layout.x)).toBe(true);
    expect(Number.isFinite(layout.y)).toBe(true);
    expect(Number.isFinite(layout.width)).toBe(true);
    expect(Number.isFinite(layout.height)).toBe(true);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
  };

  const startLayout = await readLayout();
  assertFinitePositiveLayout(startLayout);

  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
  }
  const afterNegativeDrift = await readLayout();
  assertFinitePositiveLayout(afterNegativeDrift);

  for (let i = 0; i < 80; i += 1) {
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowDown');
  }
  const afterPositiveDrift = await readLayout();
  assertFinitePositiveLayout(afterPositiveDrift);

  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press('Alt+ArrowLeft');
    await page.keyboard.press('Alt+ArrowUp');
  }
  const afterFineAdjust = await readLayout();
  assertFinitePositiveLayout(afterFineAdjust);

  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveAttribute(
    'data-selection-node-id',
    selectedNodeId
  );

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudges preserve primary selection anchor across multi-selection while moving selected nodes canonically', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 140, y: 180 }, { x: 260, y: 300 });
  await createFrame(page, { x: 340, y: 180 }, { x: 460, y: 300 });
  await createFrame(page, { x: 540, y: 180 }, { x: 660, y: 300 });

  const nodes = page.locator('[data-node-id]');
  await waitForNodeCount(page, 3);

  const first = nodes.nth(0);
  const second = nodes.nth(1);
  const third = nodes.nth(2);

  await activateTool(page, 'select');
  await first.click({ force: true });
  await page.keyboard.down('Shift');
  await second.click({ force: true });
  await third.click({ force: true });
  await page.keyboard.up('Shift');

  await expect(page.getByTestId('selection-outline')).toHaveCount(3);
  const selectionPrimary = page.locator('[data-selection-primary="true"]');
  await expect(selectionPrimary).toHaveCount(1);
  const primaryBefore = await selectionPrimary.getAttribute('data-selection-node-id');
  expect(primaryBefore).toBeTruthy();

  const selectedNodeIds = await page.evaluate(() => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const ids = state?.selection?.ids;
    if (ids instanceof Set) return Array.from(ids);
    if (Array.isArray(ids)) return ids.slice();
    return [];
  });
  expect(selectedNodeIds.length).toBe(3);

  const readLayoutMap = async () =>
    page.evaluate((ids) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const map = {};
      for (const id of ids) {
        const layout = state?.document?.layout?.nodes?.[id];
        if (!layout) continue;
        map[id] = {
          x: layout.x ?? null,
          y: layout.y ?? null,
        };
      }
      return map;
    }, selectedNodeIds);

  const before = await readLayoutMap();
  for (const id of selectedNodeIds) {
    expect(before[id]).toBeTruthy();
    expect(Number.isFinite(before[id].x)).toBe(true);
    expect(Number.isFinite(before[id].y)).toBe(true);
  }

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Alt+ArrowLeft');
  await page.keyboard.press('Alt+ArrowUp');

  const after = await readLayoutMap();
  let movedCount = 0;
  for (const id of selectedNodeIds) {
    expect(after[id]).toBeTruthy();
    const dx = after[id].x - before[id].x;
    const dy = after[id].y - before[id].y;
    if (dx !== 0 || dy !== 0) movedCount += 1;
  }
  expect(movedCount).toBe(selectedNodeIds.length);

  await expect(page.getByTestId('selection-outline')).toHaveCount(3);
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', primaryBefore);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudges remain lawful under undo and redo history', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();

  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  const selectedNodeId = await node.getAttribute('data-node-id');
  expect(selectedNodeId).toBeTruthy();

  const selectionPrimary = page.locator('[data-selection-primary="true"]');
  await expect(selectionPrimary).toHaveCount(1);
  const primaryBefore = await selectionPrimary.getAttribute('data-selection-node-id');
  expect(primaryBefore).toBe(selectedNodeId);

  const readLayout = async () =>
    page.evaluate((id) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const layout = state?.document?.layout?.nodes?.[id] ?? null;
      if (!layout) return null;
      return {
        x: layout.x ?? null,
        y: layout.y ?? null,
        width: layout.width ?? null,
        height: layout.height ?? null,
      };
    }, selectedNodeId);

  const before = await readLayout();
  expect(before).toBeTruthy();

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Alt+ArrowLeft');

  const afterNudge = await readLayout();
  expect(afterNudge).toBeTruthy();
  expect(afterNudge).not.toEqual(before);

  let undoSteps = 0;
  for (; undoSteps < 8; undoSteps += 1) {
    const current = await readLayout();
    if (JSON.stringify(current) === JSON.stringify(before)) break;
    await page.evaluate(() => globalThis.__droppleDispatcher?.undo?.());
  }
  expect(undoSteps).toBeGreaterThan(0);
  await expect
    .poll(async () => await readLayout())
    .toEqual(before);

  for (let i = 0; i < undoSteps; i += 1) {
    await page.evaluate(() => globalThis.__droppleDispatcher?.redo?.());
  }
  await expect
    .poll(async () => await readLayout())
    .toEqual(afterNudge);

  const finalLayout = await readLayout();
  expect(finalLayout).toEqual(afterNudge);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudge remains stable across workspace route transitions without duplicate handler drift', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  let node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();
  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);

  const selectedNodeIdFirst = await node.getAttribute('data-node-id');
  expect(selectedNodeIdFirst).toBeTruthy();

  const readLayoutX = async (id) =>
    page.evaluate((id) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      return state?.document?.layout?.nodes?.[id]?.x ?? null;
    }, id);

  const beforeFirstNudge = await readLayoutX(selectedNodeIdFirst);
  expect(typeof beforeFirstNudge).toBe('number');
  await page.keyboard.press('ArrowRight');
  const afterFirstNudge = await readLayoutX(selectedNodeIdFirst);
  expect(typeof afterFirstNudge).toBe('number');
  const firstDelta = afterFirstNudge - beforeFirstNudge;
  expect(firstDelta).toBeGreaterThan(0);

  await page.goto('/workspace/graphic', { waitUntil: 'networkidle' });
  await expect(page.getByTestId('canvas-host')).toBeVisible();
  await page.goto('/workspace/new', { waitUntil: 'networkidle' });
  await expect(page.getByTestId('canvas-host')).toBeVisible();

  await createFrame(page, { x: 260, y: 220 }, { x: 400, y: 340 });
  node = page.locator('[data-node-id]').first();
  await expect(node).toBeVisible();
  const selectedNodeIdSecond = await node.getAttribute('data-node-id');
  expect(selectedNodeIdSecond).toBeTruthy();
  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);

  const beforeSecondNudge = await readLayoutX(selectedNodeIdSecond);
  expect(typeof beforeSecondNudge).toBe('number');
  await page.keyboard.press('ArrowRight');
  const afterSecondNudge = await readLayoutX(selectedNodeIdSecond);
  expect(typeof afterSecondNudge).toBe('number');
  const secondDelta = afterSecondNudge - beforeSecondNudge;
  expect(secondDelta).toBeGreaterThan(0);
  expect(secondDelta).toBe(firstDelta);

  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveAttribute(
    'data-selection-node-id',
    selectedNodeIdSecond
  );

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});
