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
  const emptyWorld = page.getByTestId('uiux-empty-world');
  if (await emptyWorld.isVisible().catch(() => false)) {
    await page.getByTestId('uiux-empty-world-card-blankPage').click();
    await expect(page.getByTestId('uiux-intent-confirmation')).toBeVisible();
    await page.getByTestId('uiux-intent-continue').click();
    await expect(page.getByTestId('uiux-first-expression')).toBeVisible();
    await page.getByTestId('uiux-first-expression-continue').click();
    await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute(
      'data-creative-initiation-focus',
      'false'
    );
    await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute(
      'data-first-expression-focus',
      'false'
    );
    await page.evaluate(() => {
      const dispatcher = globalThis.__droppleDispatcher;
      const state = dispatcher?.getState?.();
      const nodeIds = Object.keys(state?.document?.sceneGraph?.nodes ?? {});
      nodeIds.forEach((id) => {
        dispatcher?.dispatch?.({
          type: 'node/delete',
          payload: { id },
        });
      });
      dispatcher?.dispatch?.({ type: 'SELECTION_CLEAR' });
    });
    await expect(page.locator('[data-node-id]:visible')).toHaveCount(0);
  }
  await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();
  await expectSingleVisibleCanvasHost(page);
}

async function gotoCreateAuthoringWorkspace(page) {
  await page.goto('/workspace/create', { waitUntil: 'networkidle' });

  await expect(page.getByTestId('uiux-empty-world')).toBeVisible();
  await page.getByTestId('uiux-empty-world-card-blankPage').click();
  await expect(page.getByTestId('uiux-intent-confirmation')).toBeVisible();
  await page.getByTestId('uiux-intent-continue').click();

  await expect(page.getByTestId('uiux-first-expression')).toBeVisible();
  await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute(
    'data-first-expression-focus',
    'true'
  );

  await page.getByTestId('uiux-first-expression-continue').click();

  await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute(
    'data-creative-initiation-focus',
    'false'
  );
  await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute(
    'data-first-expression-focus',
    'false'
  );
  await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute(
    'data-authoring-ready',
    'true'
  );
  await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();
  await expectSingleVisibleCanvasHost(page);
}

async function activateTool(page, toolId) {
  const tool = page.locator(`[data-tool-id="${toolId}"]`).first();
  await tool.click();
  await expect(tool).toBeVisible();
  if (toolId === 'select') {
    await expect(tool).toHaveClass(/is-active/);
  }
}

async function ensureNodeSelected(page, node, options = {}) {
  const nodeId = await node.getAttribute('data-node-id');
  expect(nodeId).toBeTruthy();

  await activateTool(page, 'select');

  const primarySelection = page.locator(
    `[data-selection-primary="true"][data-selection-node-id="${nodeId}"]`
  );
  const selectionAlreadyMatches =
    (await primarySelection.count()) > 0 &&
    (await page.getByTestId('selection-outline').count()) === 1;

  if (!selectionAlreadyMatches) {
    if (options.position) {
      await node.click({ force: true, position: options.position });
    } else {
      await node.click({ force: true });
    }
  }

  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(primarySelection).toHaveCount(1);
  return nodeId;
}

async function clearSelectionFromCanvas(page) {
  await page.evaluate(() => {
    globalThis.__droppleDispatcher?.dispatch?.({ type: 'SELECTION_CLEAR' });
  });
  await expect(page.getByTestId('selection-outline')).toHaveCount(0);
}

async function dragOnCanvas(page, from, to) {
  const canvas = visibleCanvasHost(page);
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
  const nodes = visibleNodeLocators(page);
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
    const canvas = visibleCanvasHost(page);
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
  const nodes = page.locator('[data-node-id]:visible');
  await expect
    .poll(async () => await nodes.count(), {
      timeout: 10000,
    })
    .toBe(expectedCount);

  await expect(nodes).toHaveCount(expectedCount);
}

function visibleNodeLocator(page) {
  return page.locator('[data-node-id]:visible').first();
}

function visibleNodeLocators(page) {
  return page.locator('[data-node-id]:visible');
}

function visibleNodeById(page, nodeId) {
  return page.locator(`[data-pointer-role="node"][data-node-id="${nodeId}"]:visible`).first();
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
  const canvas = visibleCanvasHost(page);
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

async function dragNode(
  page,
  locator,
  delta,
  { holdAlt = false, holdShift = false, holdShiftDuringMove = false } = {}
) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Target node did not render');
  }

  if (holdShift) {
    await page.keyboard.down('Shift');
    await page.waitForTimeout(16);
  }

  if (holdAlt) {
    await page.keyboard.down('Alt');
    await page.waitForTimeout(16);
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  if (holdShiftDuringMove) {
    await page.keyboard.down('Shift');
    await page.waitForTimeout(16);
  }
  await page.mouse.move(
    box.x + box.width / 2 + delta.x,
    box.y + box.height / 2 + delta.y,
    { steps: 10 }
  );
  await page.mouse.up();

  if (holdShiftDuringMove) {
    await page.keyboard.up('Shift');
  }
  if (holdAlt) {
    await page.keyboard.up('Alt');
  }
  if (holdShift) {
    await page.keyboard.up('Shift');
  }
}

async function dragNodeWithAltReleaseBeforeThreshold(page, locator, delta) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Target node did not render');
  }

  await page.keyboard.down('Alt');
  await page.waitForTimeout(16);

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();

  // Release alt before any drag threshold-crossing movement.
  await page.keyboard.up('Alt');
  await page.waitForTimeout(48);

  // Cross threshold only after alt release.
  await page.mouse.move(cx + delta.x, cy + delta.y, { steps: 10 });
  await page.mouse.up();
}

async function dragNodeWithShiftReleaseMidDrag(page, locator, delta, releaseAfter = 24) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Target node did not render');
  }

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const horizontalFirst = Math.max(releaseAfter, Math.round(delta.x * 0.4));
  await page.mouse.move(cx, cy);
  await page.mouse.down();

  // Start the drag first, then toggle shift during the active interaction.
  await page.mouse.move(cx + 18, cy + 12, { steps: 4 });
  await page.keyboard.down('Shift');
  await page.waitForTimeout(16);
  await page.mouse.move(cx + horizontalFirst, cy + 12, { steps: 6 });
  await page.keyboard.up('Shift');
  await page.waitForTimeout(16);

  // Continue drag after shift release; Y should now be allowed to change.
  await page.mouse.move(cx + delta.x, cy + delta.y, { steps: 8 });
  await page.mouse.up();
}

async function dragNodeWithAltHeldShiftReleasedMidDrag(page, locator, delta) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Target node did not render');
  }

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.keyboard.down('Alt');
  await page.waitForTimeout(16);

  await page.mouse.move(cx, cy);
  await page.mouse.down();
  // Cross threshold with alt held (duplicate request stays live).
  await page.mouse.move(cx + 20, cy + 8, { steps: 4 });
  // Enable shift only after promotion to move.
  await page.keyboard.down('Shift');
  await page.waitForTimeout(16);
  await page.mouse.move(cx + 44, cy + 8, { steps: 4 });
  await page.keyboard.up('Shift');
  await page.waitForTimeout(16);
  // Continue with alt still down; y movement should now be applied without lock.
  await page.mouse.move(cx + delta.x, cy + delta.y, { steps: 8 });
  await page.mouse.up();

  await page.keyboard.up('Alt');
}

async function cancelActivePointerSession(page, { pointerId = 1, clientX = 0, clientY = 0 } = {}) {
  await page.evaluate(
    ({ id, x, y }) => {
      const event = new PointerEvent('pointercancel', {
        pointerId: id,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      });
      window.dispatchEvent(event);
    },
    { id: pointerId, x: clientX, y: clientY },
  );
}

async function dragResizeHandle(page, locator, delta) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Resize handle did not render');
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endX = startX + delta.x;
  const endY = startY + delta.y;

  await locator.dispatchEvent('pointerdown', {
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    bubbles: true,
    cancelable: true,
    button: 0,
    buttons: 1,
    clientX: startX,
    clientY: startY,
  });

  await page.evaluate(
    async ({ startX, startY, endX, endY }) => {
      const steps = 10;
      for (let index = 1; index <= steps; index += 1) {
        const progress = index / steps;
        const clientX = startX + (endX - startX) * progress;
        const clientY = startY + (endY - startY) * progress;

        window.dispatchEvent(
          new PointerEvent('pointermove', {
            pointerId: 1,
            pointerType: 'mouse',
            isPrimary: true,
            bubbles: true,
            cancelable: true,
            buttons: 1,
            clientX,
            clientY,
          })
        );
        window.dispatchEvent(
          new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            buttons: 1,
            clientX,
            clientY,
          })
        );

        await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
      }

      window.dispatchEvent(
        new PointerEvent('pointerup', {
          pointerId: 1,
          pointerType: 'mouse',
          isPrimary: true,
          bubbles: true,
          cancelable: true,
          button: 0,
          buttons: 0,
          clientX: endX,
          clientY: endY,
        })
      );
      window.dispatchEvent(
        new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          button: 0,
          buttons: 0,
          clientX: endX,
          clientY: endY,
        })
      );
    },
    { startX, startY, endX, endY }
  );
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

async function waitForRuntimeSelectionCount(page, expectedCount) {
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const ids = state?.selection?.ids;
        if (ids instanceof Set) return ids.size;
        if (Array.isArray(ids)) return ids.length;
        return 0;
      });
    })
    .toBe(expectedCount);
}

async function triggerAlignmentShortcut(page, key, { shift = false, nodeIds = null } = {}) {
  await page.evaluate(
    ({ keyboardKey, shiftKey, explicitNodeIds }) => {
      return window.dispatchEvent(
        new CustomEvent('dropple:test:alignment-shortcut', {
          detail: {
            key: keyboardKey,
            shiftKey,
            nodeIds: Array.isArray(explicitNodeIds) ? explicitNodeIds : null,
          },
          bubbles: true,
          cancelable: true,
        }),
      );
    },
    { keyboardKey: key, shiftKey: shift, explicitNodeIds: nodeIds },
  );
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

  const node = visibleNodeLocator(page);
  await expect(node).toBeVisible();

  await ensureNodeSelected(page, node);

  const before = await node.boundingBox();
  expect(before).not.toBeNull();

  await dragNode(page, node, { x: 90, y: 60 });
  await waitForMoved(node, before, { dx: 40, dy: 20 });
});

test('workspace new can multi-select and drag multiple nodes together', async ({ page }) => {
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 140, y: 180 }, { x: 280, y: 300 });
  await createFrame(page, { x: 320, y: 220 }, { x: 460, y: 340 });

  const nodes = visibleNodeLocators(page);
  await waitForNodeCount(page, 2);

  const first = nodes.nth(0);
  const second = nodes.nth(1);

  await activateTool(page, 'select');
  await second.click({ force: true });
  await page.keyboard.press('ArrowRight');
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

  const nodes = visibleNodeLocators(page);
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

test('workspace new grouping survives deselect and reselect as a group wrapper', async ({ page }) => {
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 140, y: 180 }, { x: 280, y: 300 });
  await createFrame(page, { x: 320, y: 220 }, { x: 460, y: 340 });

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return Array.from(
          new Set(
            Array.from(document.querySelectorAll('[data-node-id]'))
              .map((el) => el.getAttribute('data-node-id'))
              .filter(Boolean)
          )
        ).length;
      });
    })
    .toBe(2);

  const createdIds = await page.evaluate(() => {
    return Array.from(
      new Set(
        Array.from(document.querySelectorAll('[data-node-id]'))
          .map((el) => el.getAttribute('data-node-id'))
          .filter(Boolean)
      )
    );
  });

  const first = visibleNodeById(page, createdIds[0]);
  const second = visibleNodeById(page, createdIds[1]);

  await marqueeRenderedNodes(page, [first, second]);
  await expect(page.getByTestId('selection-outline')).toHaveCount(2);

  const secondBox = await second.boundingBox();
  if (!secondBox) {
    throw new Error('Second node did not render');
  }
  await page.mouse.click(
    secondBox.x + secondBox.width / 2,
    secondBox.y + secondBox.height / 2,
    { button: 'right' }
  );
  await expect(page.getByTestId('selection-context-menu')).toBeVisible();
  await expect(page.getByTestId('selection-context-group')).toBeVisible();
  await page.getByTestId('selection-context-group').click();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const ids = state?.selection?.ids instanceof Set
          ? Array.from(state.selection.ids)
          : Array.isArray(state?.selection?.ids)
          ? state.selection.ids
          : [];
        const primary = state?.selection?.primary ?? null;
        const nodesById = state?.document?.sceneGraph?.nodes ?? {};
        const selectedNode = primary ? nodesById[primary] ?? null : null;
        return {
          ids,
          primary,
          type: selectedNode?.type ?? null,
        };
      });
    })
    .toEqual({
      ids: expect.arrayContaining([expect.stringMatching(/^group[-_]/)]),
      primary: expect.stringMatching(/^group[-_]/),
      type: 'group',
    });

  const groupInfo = await page.evaluate(() => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const ids = state?.selection?.ids instanceof Set
      ? Array.from(state.selection.ids)
      : Array.isArray(state?.selection?.ids)
      ? state.selection.ids
      : [];
    const primary = state?.selection?.primary ?? null;
    const nodesById = state?.document?.sceneGraph?.nodes ?? {};
    const groupId = primary || ids.find((id) => String(id).startsWith('group'));
    const groupNode = groupId ? nodesById[groupId] ?? null : null;
    return {
      groupId,
      type: groupNode?.type ?? null,
    };
  });

  expect(groupInfo.groupId).toBeTruthy();
  expect(groupInfo.type).toBe('group');

  const canvas = visibleCanvasHost(page);
  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) {
    throw new Error('Canvas host did not render');
  }

  await page.mouse.click(canvasBox.x + 24, canvasBox.y + 24);

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const ids = state?.selection?.ids instanceof Set
          ? Array.from(state.selection.ids)
          : Array.isArray(state?.selection?.ids)
          ? state.selection.ids
          : [];
        return ids.length;
      });
    })
    .toBe(0);

  const groupedChild = visibleNodeById(page, createdIds[0]);
  await expect(groupedChild).toBeVisible();
  await groupedChild.click({ force: true });

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const ids = state?.selection?.ids instanceof Set
          ? Array.from(state.selection.ids)
          : Array.isArray(state?.selection?.ids)
          ? state.selection.ids
          : [];
        const primary = state?.selection?.primary ?? null;
        const nodesById = state?.document?.sceneGraph?.nodes ?? {};
        const selectedNode = primary ? nodesById[primary] ?? null : null;
        return {
          ids,
          primary,
          type: selectedNode?.type ?? null,
        };
      });
    })
    .toEqual({
      ids: [groupInfo.groupId],
      primary: groupInfo.groupId,
      type: 'group',
    });
});

test('workspace new shift-marquee adds to the existing selection and preserves a primary outline', async ({ page }) => {
  const logs = captureMarqueeDebugLogs(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 140, y: 180 }, { x: 260, y: 300 });
  await createFrame(page, { x: 340, y: 180 }, { x: 460, y: 300 });
  await createFrame(page, { x: 540, y: 180 }, { x: 660, y: 300 });

  const nodes = visibleNodeLocators(page);
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

  const node = visibleNodeLocator(page);
  await expect(node).toBeVisible();

  await ensureNodeSelected(page, node);

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
  const node = visibleNodeLocator(page);
  await expect(node).toBeVisible();

  await ensureNodeSelected(page, node);

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

test('workspace new inspector projects capability domains for a selected frame', async ({ page }) => {
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = visibleNodeLocator(page);
  await expect(node).toBeVisible();

  await ensureNodeSelected(page, node);

  await expect(page.getByTestId('inspector-shell')).toBeVisible();
  await expect(page.getByTestId('inspector-context-summary')).toContainText('Context: selection');
  await expect(page.locator('.inspector-section-header')).toContainText([
    'Structure',
    'Layout',
    'Appearance',
    'Semantics',
    'Motion',
    'Export',
  ]);
  await expect(page.locator('.inspector-section-header').filter({ hasText: 'Content' })).toHaveCount(0);
  await expect(page.getByTestId('inspector-action-delete')).toBeVisible();
  await expect(page.getByTestId('uiux-motion-attach')).toBeVisible();
});

test('workspace new selected frame exposes and applies canonical appearance properties through inspector', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = visibleNodeLocator(page);
  await expect(node).toBeVisible();
  const nodeId = await ensureNodeSelected(page, node);

  await expect(page.getByTestId('inspector-shell')).toBeVisible();
  await expect(page.locator('.inspector-section-header')).toContainText([
    'Structure',
    'Layout',
    'Appearance',
    'Semantics',
    'Motion',
    'Export',
  ]);
  const fillPresetSelect = page.getByRole('combobox', { name: 'Fill' });
  const opacityInput = page.locator('label:has-text("Opacity") input[type="range"]');
  const strokeSection = page.locator('.inspector-group').filter({ hasText: 'Stroke' });
  const addStrokeButton = page.getByRole('button', { name: 'Stroke' });
  const readCursorIndex = async () =>
    page.evaluate(() => globalThis.__droppleDispatcher?.getState?.()?.cursorIndex ?? -1);
  const setRangeRatio = async (locator, ratio) => {
    const targetValue = ratio.toFixed(2);
    await expect(locator).toBeVisible();
    await locator.focus();
    await page.keyboard.press('Home');
    await expect
      .poll(async () => locator.inputValue())
      .toBe('0');

    const increments = Math.round(ratio / 0.01);
    for (let index = 0; index < increments; index += 1) {
      await page.keyboard.press('ArrowRight');
    }

    await expect
      .poll(async () => Number.parseFloat(await locator.inputValue()).toFixed(2))
      .toBe(targetValue);
  };

  await expect(fillPresetSelect).toBeVisible();
  await expect(opacityInput).toBeVisible();
  await expect(addStrokeButton).toBeVisible();
  const cursorBeforeFill = await readCursorIndex();
  await fillPresetSelect.selectOption('token.color.secondary');

  await expect
    .poll(async () =>
      page.evaluate((id) => {
        const style = globalThis.__droppleDispatcher?.getState?.()?.document?.sceneGraph?.nodes?.[id]?.style ?? null;
        return style
          ? {
              fill: style.fill ?? null,
              opacity: style.opacity ?? null,
            }
          : null;
      }, nodeId),
    )
    .toEqual({
      fill: 'token.color.secondary',
      opacity: null,
    });
  await expect.poll(readCursorIndex).toBe(cursorBeforeFill + 1);

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByTestId('inspector-shell')).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const ids = state?.selection?.ids instanceof Set
          ? Array.from(state.selection.ids)
          : Array.isArray(state?.selection?.ids)
            ? state.selection.ids
            : [];
        return {
          ids,
          primary: state?.selection?.primary ?? null,
        };
      }),
    )
    .toEqual({
      ids: [nodeId],
      primary: nodeId,
    });
  await expect
    .poll(async () =>
      page.evaluate((id) => {
        const style = globalThis.__droppleDispatcher?.getState?.()?.document?.sceneGraph?.nodes?.[id]?.style ?? null;
        return style
          ? {
              fill: style.fill ?? null,
              opacity: style.opacity ?? null,
            }
          : null;
      }, nodeId),
    )
    .toEqual({
      fill: null,
      opacity: null,
    });

  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(page.getByTestId('inspector-shell')).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const ids = state?.selection?.ids instanceof Set
          ? Array.from(state.selection.ids)
          : Array.isArray(state?.selection?.ids)
            ? state.selection.ids
            : [];
        return {
          ids,
          primary: state?.selection?.primary ?? null,
        };
      }),
    )
    .toEqual({
      ids: [nodeId],
      primary: nodeId,
    });
  await expect
    .poll(async () =>
      page.evaluate((id) => {
        const style = globalThis.__droppleDispatcher?.getState?.()?.document?.sceneGraph?.nodes?.[id]?.style ?? null;
        return style
          ? {
              fill: style.fill ?? null,
              opacity: style.opacity ?? null,
            }
          : null;
      }, nodeId),
    )
    .toEqual({
      fill: 'token.color.secondary',
      opacity: null,
    });

  await setRangeRatio(opacityInput, 0.42);
  await expect
    .poll(async () =>
      page.evaluate((id) => {
        const style = globalThis.__droppleDispatcher?.getState?.()?.document?.sceneGraph?.nodes?.[id]?.style ?? null;
        return style
          ? {
              fill: style.fill ?? null,
              opacity: style.opacity ?? null,
            }
          : null;
      }, nodeId),
    )
    .toEqual({
      fill: 'token.color.secondary',
      opacity: 0.42,
    });

  await addStrokeButton.click();

  const strokeColorInput = page
    .locator('label')
    .filter({ hasText: 'Stroke' })
    .locator('input[type="color"]')
    .last();
  const strokeWidthInput = strokeSection.locator('input[type="number"]');

  await expect
    .poll(async () =>
      page.evaluate((id) => {
        const style = globalThis.__droppleDispatcher?.getState?.()?.document?.sceneGraph?.nodes?.[id]?.style ?? null;
        return style?.stroke ?? null;
      }, nodeId),
    )
    .toEqual({ color: '#000000', width: 1 });

  await expect(strokeColorInput).toBeVisible();
  await expect(strokeWidthInput).toBeVisible();
  await strokeColorInput.fill('#ff0000');
  await expect
    .poll(async () =>
      page.evaluate((id) => {
        const style = globalThis.__droppleDispatcher?.getState?.()?.document?.sceneGraph?.nodes?.[id]?.style ?? null;
        return style?.stroke ?? null;
      }, nodeId),
    )
    .toEqual({ color: '#ff0000', width: 1 });

  const cursorBeforeStrokeWidth = await readCursorIndex();
  await strokeWidthInput.fill('3');
  await strokeWidthInput.blur();

  const canonicalStyle = await page.evaluate((id) => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const style = state?.document?.sceneGraph?.nodes?.[id]?.style ?? null;
    return style
      ? {
          fill: style.fill ?? null,
          fills: style.fills ?? null,
          opacity: style.opacity ?? null,
          stroke: style.stroke ?? null,
          strokes: style.strokes ?? null,
        }
      : null;
  }, nodeId);

  expect(canonicalStyle).toBeTruthy();
  expect(canonicalStyle.fill).toBe('token.color.secondary');
  expect(canonicalStyle.opacity).toBe(0.42);
  expect(canonicalStyle.stroke).toEqual({ color: '#ff0000', width: 3 });
  expect(canonicalStyle.fills).toEqual([{ type: 'solid', color: 'token.color.secondary', enabled: true }]);
  expect(canonicalStyle.strokes).toEqual([{ color: '#ff0000', width: 3, enabled: true }]);
  await expect.poll(readCursorIndex).toBe(cursorBeforeStrokeWidth + 1);

  const selectedVisual = await node.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      backgroundColor: computed.backgroundColor,
      opacity: computed.opacity,
      boxShadow: computed.boxShadow,
    };
  });

  expect(selectedVisual.backgroundColor).toBe('rgb(99, 102, 241)');
  expect(Number(selectedVisual.opacity)).toBeCloseTo(0.42, 2);
  expect(selectedVisual.boxShadow).not.toBe('none');

  await clearSelectionFromCanvas(page);
  await expect
    .poll(async () =>
      visibleNodeById(page, nodeId).evaluate((element) => ({
        selected: element.classList.contains('is-selected'),
        primary: element.classList.contains('is-primary'),
      })),
    )
    .toEqual({ selected: false, primary: false });
  await expect
    .poll(async () =>
      visibleNodeById(page, nodeId).evaluate((element) => getComputedStyle(element).borderTopWidth),
    )
    .toBe('3px');

  const unselectedVisual = await visibleNodeById(page, nodeId).evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      borderTopColor: computed.borderTopColor,
      borderTopWidth: computed.borderTopWidth,
      backgroundColor: computed.backgroundColor,
      opacity: computed.opacity,
    };
  });

  expect(unselectedVisual.borderTopWidth).toBe('3px');
  expect(unselectedVisual.borderTopColor).toBe('rgb(255, 0, 0)');
  expect(unselectedVisual.backgroundColor).toBe('rgb(99, 102, 241)');
  expect(Number(unselectedVisual.opacity)).toBeCloseTo(0.42, 2);

  await visibleNodeById(page, nodeId).click();
  await expect(page.getByTestId('inspector-shell')).toBeVisible();

  await page.getByRole('button', { name: 'Undo' }).click();

  await expect(page.getByTestId('inspector-shell')).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const ids = state?.selection?.ids instanceof Set
          ? Array.from(state.selection.ids)
          : Array.isArray(state?.selection?.ids)
            ? state.selection.ids
            : [];
        return {
          ids,
          primary: state?.selection?.primary ?? null,
        };
      }),
    )
    .toEqual({
      ids: [nodeId],
      primary: nodeId,
    });
  await expect
    .poll(async () =>
      page.evaluate((id) => {
        const style = globalThis.__droppleDispatcher?.getState?.()?.document?.sceneGraph?.nodes?.[id]?.style ?? null;
        return style
          ? {
              fill: style.fill ?? null,
              opacity: style.opacity ?? null,
              stroke: style.stroke ?? null,
            }
          : null;
      }, nodeId),
    )
    .toEqual({
      fill: 'token.color.secondary',
      opacity: 0.42,
      stroke: { color: '#ff0000', width: 1 },
    });
  await expect
    .poll(async () =>
      visibleNodeById(page, nodeId).evaluate((element) => getComputedStyle(element).borderTopWidth),
    )
    .toBe('1px');

  await page.getByRole('button', { name: 'Redo' }).click();

  await expect(page.getByTestId('inspector-shell')).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const ids = state?.selection?.ids instanceof Set
          ? Array.from(state.selection.ids)
          : Array.isArray(state?.selection?.ids)
            ? state.selection.ids
            : [];
        return {
          ids,
          primary: state?.selection?.primary ?? null,
        };
      }),
    )
    .toEqual({
      ids: [nodeId],
      primary: nodeId,
    });
  await expect
    .poll(async () =>
      page.evaluate((id) => {
        const style = globalThis.__droppleDispatcher?.getState?.()?.document?.sceneGraph?.nodes?.[id]?.style ?? null;
        return style
          ? {
              fill: style.fill ?? null,
              opacity: style.opacity ?? null,
              stroke: style.stroke ?? null,
            }
          : null;
      }, nodeId),
    )
    .toEqual({
      fill: 'token.color.secondary',
      opacity: 0.42,
      stroke: { color: '#ff0000', width: 3 },
    });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new create menu projects existing uiux creation capabilities', async ({ page }) => {
  await gotoNewWorkspace(page);

  await page
    .getByTestId('uiux-topbar-authoring-group')
    .getByRole('button', { name: 'Create' })
    .click();
  await expect(page.getByRole('menuitem', { name: 'Frame' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Text' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Shape' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Image' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Path' })).toHaveCount(0);
});

test('workspace new uiux left rail only projects live utility tools and admitted creation tools', async ({ page }) => {
  await gotoNewWorkspace(page);

  await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="frame"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="text"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="shape"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-id="image"]').first()).toBeVisible();

  await expect(page.locator('[data-tool-id="move"]')).toHaveCount(0);
  await expect(page.locator('[data-tool-id="resize"]')).toHaveCount(0);
  await expect(page.locator('[data-tool-id="path"]')).toHaveCount(0);
});

test('workspace create first-expression suppresses misleading create-tool interaction until authoring-ready', async ({ page }) => {
  await page.goto('/workspace/create', { waitUntil: 'networkidle' });

  await expect(page.getByTestId('uiux-empty-world')).toBeVisible();
  await page.getByTestId('uiux-empty-world-card-blankPage').click();
  await expect(page.getByTestId('uiux-intent-confirmation')).toBeVisible();
  await page.getByTestId('uiux-intent-continue').click();

  const worldEditor = page.getByTestId('uiux-world-editor');
  await expect(worldEditor).toHaveAttribute('data-first-expression-focus', 'true');
  await expect(worldEditor).toHaveAttribute('data-authoring-ready', 'false');

  for (const toolId of ['frame', 'text', 'shape', 'image']) {
    const tool = page.locator(`[data-tool-id="${toolId}"]`).first();
    await expect(tool).toBeVisible();
    await expect(tool).toHaveAttribute('data-tool-disabled', 'true');
  }

  await expect(page.locator('[data-tool-id="move"]')).toHaveCount(0);
  await expect(page.locator('[data-tool-id="resize"]')).toHaveCount(0);
  await expect(page.locator('[data-tool-id="path"]')).toHaveCount(0);
  await expect(page.getByTestId('uiux-create-mode-hint')).toHaveCount(0);

  await page.getByTestId('uiux-first-expression-continue').click();

  await expect(worldEditor).toHaveAttribute('data-first-expression-focus', 'false');
  await expect(worldEditor).toHaveAttribute('data-authoring-ready', 'true');

  for (const toolId of ['frame', 'text', 'shape', 'image']) {
    const tool = page.locator(`[data-tool-id="${toolId}"]`).first();
    await expect(tool).toBeVisible();
    await expect(tool).toHaveAttribute('data-tool-disabled', 'false');
  }
});

test('workspace new text shape and image tools create native nodes through the live uiux creator path', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  await waitForNodeCount(page, 1);

  const frameNode = visibleNodeLocator(page);
  const frameId = await ensureNodeSelected(page, frameNode);
  const frameNodeById = visibleNodeById(page, frameId);

  const clickCreateInsideFrame = async (toolId) => {
    await activateTool(page, toolId);
    const box = await frameNodeById.boundingBox();
    if (!box) {
      throw new Error(`Selected frame did not render for ${toolId} creation`);
    }

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  };

  await clickCreateInsideFrame('text');
  await waitForNodeCount(page, 2);

  const textInfo = await page.evaluate(() => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const ids = Array.isArray(state?.selection?.ids) ? state.selection.ids : Array.from(state?.selection?.ids ?? []);
    const primary = state?.selection?.primary ?? null;
    const node = primary ? state?.document?.sceneGraph?.nodes?.[primary] ?? null : null;
    return {
      selectedCount: ids.length,
      primary,
      type: node?.type ?? null,
      parentId: node?.parentId ?? null,
    };
  });
  expect(textInfo.selectedCount).toBe(1);
  expect(textInfo.type).toBe('text');

  await ensureNodeSelected(page, frameNodeById, { position: { x: 16, y: 16 } });
  expect(textInfo.parentId).toBe(frameId);

  await clickCreateInsideFrame('shape');
  await waitForNodeCount(page, 3);

  const shapeInfo = await page.evaluate(() => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const primary = state?.selection?.primary ?? null;
    const node = primary ? state?.document?.sceneGraph?.nodes?.[primary] ?? null : null;
    return {
      type: node?.type ?? null,
      parentId: node?.parentId ?? null,
    };
  });
  expect(shapeInfo.type).toBe('shape');
  expect(shapeInfo.parentId).toBe(frameId);

  await ensureNodeSelected(page, frameNodeById, { position: { x: 16, y: 16 } });
  await clickCreateInsideFrame('image');
  await waitForNodeCount(page, 4);

  const imageInfo = await page.evaluate(() => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const primary = state?.selection?.primary ?? null;
    const node = primary ? state?.document?.sceneGraph?.nodes?.[primary] ?? null : null;
    return {
      type: node?.type ?? null,
      parentId: node?.parentId ?? null,
    };
  });
  expect(imageInfo.type).toBe('image');
  expect(imageInfo.parentId).toBe(frameId);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace create natural authoring path exposes active create feedback and creates native children inside the selected frame', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoCreateAuthoringWorkspace(page);

  await expect(page.locator('[data-tool-id="move"]')).toHaveCount(0);
  await expect(page.locator('[data-tool-id="resize"]')).toHaveCount(0);
  await expect(page.locator('[data-tool-id="path"]')).toHaveCount(0);

  await activateTool(page, 'frame');
  await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute('data-active-create-tool-id', 'frame');
  await expect(page.getByTestId('uiux-create-mode-hint')).toContainText(
    'Frame is active. Click or drag on the canvas to place a new Frame.'
  );

  const initialNodeCount = await page.locator('[data-node-id]:visible').count();
  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  await waitForNodeCount(page, initialNodeCount + 1);

  const clickCreateInsideFrame = async (toolId, hintText) => {
    await activateTool(page, toolId);
    await expect(page.getByTestId('uiux-world-editor')).toHaveAttribute(
      'data-active-create-tool-id',
      toolId
    );
    await expect(page.getByTestId('uiux-create-mode-hint')).toContainText(hintText);
    const box = await frameNodeById.boundingBox();
    if (!box) {
      throw new Error(`Selected frame did not render for ${toolId} creation`);
    }
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  };

  const readPrimaryNode = async () =>
    page.evaluate(() => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const primary = state?.selection?.primary ?? null;
      const node = primary ? state?.document?.sceneGraph?.nodes?.[primary] ?? null : null;
      return {
        primary,
        type: node?.type ?? null,
        parentId: node?.parentId ?? null,
      };
    });

  await expect
    .poll(async () => await readPrimaryNode(), {
      timeout: 10000,
    })
    .toMatchObject({
      primary: expect.any(String),
    });

  const createdFrameInfo = await readPrimaryNode();
  const frameId = createdFrameInfo.primary;
  const frameNodeById = visibleNodeById(page, frameId);
  await expect(frameNodeById).toBeVisible();
  await ensureNodeSelected(page, frameNodeById);

  await clickCreateInsideFrame('text', 'Text is active. Click inside a selected Frame to place Text.');
  await waitForNodeCount(page, initialNodeCount + 2);
  await expect(page.getByTestId('inspector-shell')).toBeVisible();
  await expect.poll(readPrimaryNode).toEqual({
    primary: expect.any(String),
    type: 'text',
    parentId: frameId,
  });

  await ensureNodeSelected(page, frameNodeById, { position: { x: 16, y: 16 } });
  await clickCreateInsideFrame('shape', 'Shape is active. Click inside a selected Frame to place a Shape.');
  await waitForNodeCount(page, initialNodeCount + 3);
  await expect(page.getByTestId('inspector-shell')).toBeVisible();
  await expect.poll(readPrimaryNode).toEqual({
    primary: expect.any(String),
    type: 'shape',
    parentId: frameId,
  });

  await ensureNodeSelected(page, frameNodeById, { position: { x: 16, y: 16 } });
  await clickCreateInsideFrame('image', 'Image is active. Click inside a selected Frame to place an Image.');
  await waitForNodeCount(page, initialNodeCount + 4);
  await expect(page.getByTestId('inspector-shell')).toBeVisible();
  await expect.poll(readPrimaryNode).toEqual({
    primary: expect.any(String),
    type: 'image',
    parentId: frameId,
  });

  await ensureNodeSelected(page, frameNodeById, { position: { x: 16, y: 16 } });
  const beforeDrag = await frameNodeById.boundingBox();
  expect(beforeDrag).not.toBeNull();
  await dragNode(page, frameNodeById, { x: 80, y: 56 });
  await waitForMoved(frameNodeById, beforeDrag, { dx: 30, dy: 20 });

  const resizeHandle = page.getByTestId('resize-handle').first();
  await expect(resizeHandle).toBeVisible();
  const beforeResize = await frameNodeById.boundingBox();
  expect(beforeResize).not.toBeNull();
  await dragResizeHandle(page, resizeHandle, { x: 48, y: 32 });
  await waitForResized(frameNodeById, beforeResize, { dw: 16, dh: 12 });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace create moving a frame carries its created uiux descendants with it', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoCreateAuthoringWorkspace(page);

  const initialNodeCount = await page.locator('[data-node-id]:visible').count();
  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  await waitForNodeCount(page, initialNodeCount + 1);

  const readPrimaryNode = async () =>
    page.evaluate(() => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const primary = state?.selection?.primary ?? null;
      const node = primary ? state?.document?.sceneGraph?.nodes?.[primary] ?? null : null;
      return {
        primary,
        type: node?.type ?? null,
        parentId: node?.parentId ?? null,
      };
    });

  await expect
    .poll(async () => await readPrimaryNode(), { timeout: 10000 })
    .toMatchObject({ primary: expect.any(String) });

  const frameId = (await readPrimaryNode()).primary;
  const frameNode = visibleNodeById(page, frameId);
  await expect(frameNode).toBeVisible();
  await ensureNodeSelected(page, frameNode);

  const clickCreateInsideFrame = async (toolId) => {
    await activateTool(page, toolId);
    const box = await frameNode.boundingBox();
    if (!box) throw new Error(`Selected frame did not render for ${toolId} creation`);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  };

  await clickCreateInsideFrame('text');
  await waitForNodeCount(page, initialNodeCount + 2);
  const textId = (await readPrimaryNode()).primary;
  expect((await readPrimaryNode()).parentId).toBe(frameId);

  await ensureNodeSelected(page, frameNode, { position: { x: 16, y: 16 } });
  await clickCreateInsideFrame('shape');
  await waitForNodeCount(page, initialNodeCount + 3);
  const shapeId = (await readPrimaryNode()).primary;
  expect((await readPrimaryNode()).parentId).toBe(frameId);

  await ensureNodeSelected(page, frameNode, { position: { x: 16, y: 16 } });
  await clickCreateInsideFrame('image');
  await waitForNodeCount(page, initialNodeCount + 4);
  const imageId = (await readPrimaryNode()).primary;
  expect((await readPrimaryNode()).parentId).toBe(frameId);

  const textNode = visibleNodeById(page, textId);
  const shapeNode = visibleNodeById(page, shapeId);
  const imageNode = visibleNodeById(page, imageId);

  const beforeFrame = await frameNode.boundingBox();
  const beforeText = await textNode.boundingBox();
  const beforeShape = await shapeNode.boundingBox();
  const beforeImage = await imageNode.boundingBox();
  expect(beforeFrame).not.toBeNull();
  expect(beforeText).not.toBeNull();
  expect(beforeShape).not.toBeNull();
  expect(beforeImage).not.toBeNull();

  await ensureNodeSelected(page, frameNode, { position: { x: 16, y: 16 } });
  await dragNode(page, frameNode, { x: 88, y: 64 });
  await waitForMoved(frameNode, beforeFrame, { dx: 30, dy: 20 });
  await waitForMoved(textNode, beforeText, { dx: 30, dy: 20 });
  await waitForMoved(shapeNode, beforeShape, { dx: 30, dy: 20 });
  await waitForMoved(imageNode, beforeImage, { dx: 30, dy: 20 });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace create text enters inline canvas editing and commits canonical content through the live uiux route', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoCreateAuthoringWorkspace(page);

  const initialNodeCount = await page.locator('[data-node-id]:visible').count();
  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  await waitForNodeCount(page, initialNodeCount + 1);

  const readPrimaryNode = async () =>
    page.evaluate(() => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const primary = state?.selection?.primary ?? null;
      const node = primary ? state?.document?.sceneGraph?.nodes?.[primary] ?? null : null;
      return {
        primary,
        type: node?.type ?? null,
        parentId: node?.parentId ?? null,
        content: node?.content ?? null,
      };
    });

  await expect
    .poll(async () => await readPrimaryNode(), { timeout: 10000 })
    .toMatchObject({ primary: expect.any(String) });

  const frameId = (await readPrimaryNode()).primary;
  const frameNode = visibleNodeById(page, frameId);
  await expect(frameNode).toBeVisible();
  await ensureNodeSelected(page, frameNode);

  await activateTool(page, 'text');
  const frameBox = await frameNode.boundingBox();
  if (!frameBox) throw new Error('Selected frame did not render for text creation');
  await page.mouse.click(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2);
  await waitForNodeCount(page, initialNodeCount + 2);

  const inlineEditor = page.getByTestId('inline-text-editor');
  await expect(inlineEditor).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const editor = document.querySelector('[data-testid=\"inline-text-editor\"]');
        return editor ? document.activeElement === editor : false;
      }),
    )
    .toBe(true);
  await page.keyboard.type('Hello Dropple');

  await frameNode.click({ force: true, position: { x: 16, y: 16 } });
  await expect(inlineEditor).toHaveCount(0);

  await expect.poll(readPrimaryNode).toEqual({
    primary: expect.any(String),
    type: 'frame',
    parentId: null,
    content: null,
  });

  const textNodeInfo = await expect
    .poll(async () =>
      page.evaluate((parentId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const nodes = state?.document?.sceneGraph?.nodes ?? {};
        const entry = Object.values(nodes).find((node) => node?.type === 'text' && node?.parentId === parentId);
        return entry
          ? {
              id: entry.id,
              parentId: entry.parentId ?? null,
              content: entry.content ?? null,
            }
          : null;
      }, frameId),
    )
    .toEqual({
      id: expect.any(String),
      parentId: frameId,
      content: 'Hello Dropple',
    })
    .then(async () =>
      page.evaluate((parentId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const nodes = state?.document?.sceneGraph?.nodes ?? {};
        const entry = Object.values(nodes).find((node) => node?.type === 'text' && node?.parentId === parentId);
        return entry
          ? {
              id: entry.id,
              parentId: entry.parentId ?? null,
              content: entry.content ?? null,
            }
          : null;
      }, frameId),
    );

  const textNode = visibleNodeById(page, textNodeInfo.id);
  await expect(textNode).toBeVisible();
  await textNode.dblclick({ force: true });

  await expect(inlineEditor).toBeVisible();
  await inlineEditor.selectText();
  await page.keyboard.type('Hello Dropple OS');

  await frameNode.click({ force: true, position: { x: 18, y: 18 } });
  await expect(inlineEditor).toHaveCount(0);

  await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        return state?.document?.sceneGraph?.nodes?.[nodeId]?.content ?? null;
      }, textNodeInfo.id),
    )
    .toBe('Hello Dropple OS');

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        return state?.document?.sceneGraph?.nodes?.[nodeId]?.content ?? null;
      }, textNodeInfo.id),
    )
    .toBe('Hello Dropple');

  await page.getByRole('button', { name: 'Redo' }).click();
  await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        return state?.document?.sceneGraph?.nodes?.[nodeId]?.content ?? null;
      }, textNodeInfo.id),
    )
    .toBe('Hello Dropple OS');

  const beforeFrame = await frameNode.boundingBox();
  const beforeText = await textNode.boundingBox();
  expect(beforeFrame).not.toBeNull();
  expect(beforeText).not.toBeNull();

  await ensureNodeSelected(page, frameNode, { position: { x: 16, y: 16 } });
  await dragNode(page, frameNode, { x: 84, y: 60 });
  await waitForMoved(frameNode, beforeFrame, { dx: 30, dy: 20 });
  await waitForMoved(textNode, beforeText, { dx: 30, dy: 20 });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace uiux text existing-node inline edit remains canonical across reselect cancel undo redo and frame carry', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoCreateAuthoringWorkspace(page);

  const initialNodeCount = await page.locator('[data-node-id]:visible').count();
  await createFrame(page, { x: 220, y: 180 }, { x: 380, y: 320 });
  await waitForNodeCount(page, initialNodeCount + 1);

  const readSelectionSnapshot = async () =>
    page.evaluate(() => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const primary = state?.selection?.primary ?? null;
      const node = primary ? state?.document?.sceneGraph?.nodes?.[primary] ?? null : null;
      const ids =
        state?.selection?.ids instanceof Set
          ? Array.from(state.selection.ids)
          : Array.isArray(state?.selection?.ids)
            ? [...state.selection.ids]
            : [];
      return {
        primary,
        ids,
        type: node?.type ?? null,
        parentId: node?.parentId ?? null,
        content: node?.content ?? null,
      };
    });

  const readTextNodeByParent = async (parentId) =>
    page.evaluate((resolvedParentId) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const nodes = Object.values(state?.document?.sceneGraph?.nodes ?? {});
      const texts = nodes.filter((node) => node?.type === 'text' && node?.parentId === resolvedParentId);
      const first = texts[0] ?? null;
      const layout =
        (first?.id ? state?.document?.layout?.nodes?.[first.id] : null) ??
        first?.layout ??
        null;
      return {
        count: texts.length,
        id: first?.id ?? null,
        parentId: first?.parentId ?? null,
        content: first?.content ?? null,
        x: layout?.x ?? null,
        y: layout?.y ?? null,
      };
    }, parentId);

  await expect
    .poll(async () => await readSelectionSnapshot(), { timeout: 10000 })
    .toMatchObject({ primary: expect.any(String), type: 'frame' });

  const frameId = (await readSelectionSnapshot()).primary;
  const frameNode = visibleNodeById(page, frameId);
  await expect(frameNode).toBeVisible();
  await ensureNodeSelected(page, frameNode);

  await activateTool(page, 'text');
  const frameBox = await frameNode.boundingBox();
  if (!frameBox) throw new Error('Selected frame did not render for text creator closure test');
  await page.mouse.click(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2);
  await waitForNodeCount(page, initialNodeCount + 2);

  const inlineEditor = page.getByTestId('inline-text-editor');
  await expect(inlineEditor).toBeVisible();
  await expect
    .poll(async () => {
      const selection = await readSelectionSnapshot();
      return selection.type === 'text' && typeof selection.primary === 'string' ? selection.primary : null;
    })
    .toBeTruthy();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const editor = document.querySelector('[data-testid="inline-text-editor"]');
        return editor ? document.activeElement === editor : false;
      }),
    )
    .toBe(true);

  await page.keyboard.type('Creator text');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(inlineEditor).toHaveCount(0);

  const createdTextNode = await expect
    .poll(async () => await readTextNodeByParent(frameId))
    .toEqual({
      count: 1,
      id: expect.any(String),
      parentId: frameId,
      content: 'Creator text',
      x: expect.any(Number),
      y: expect.any(Number),
    })
    .then(() => readTextNodeByParent(frameId));

  const textNodeId = createdTextNode.id;
  expect(textNodeId).toBeTruthy();

  await expect.poll(readSelectionSnapshot).toMatchObject({
    primary: textNodeId,
    type: 'text',
    parentId: frameId,
    content: 'Creator text',
  });

  const textNode = visibleNodeById(page, textNodeId);
  await expect(textNode).toBeVisible();

  await clearSelectionFromCanvas(page);
  await ensureNodeSelected(page, textNode);

  const beforeManualEditBox = await textNode.boundingBox();
  const beforeManualEditCount = await readTextNodeByParent(frameId);
  await textNode.dblclick({ force: true });

  await expect(inlineEditor).toBeVisible();
  await expect(inlineEditor).toHaveValue('Creator text');
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const editor = document.querySelector('[data-testid="inline-text-editor"]');
        return editor ? document.activeElement === editor : false;
      }),
    )
    .toBe(true);
  await expect.poll(readSelectionSnapshot).toMatchObject({
    primary: textNodeId,
    ids: [textNodeId],
    type: 'text',
    parentId: frameId,
    content: 'Creator text',
  });

  const duringManualEditCount = await readTextNodeByParent(frameId);
  expect(duringManualEditCount.count).toBe(beforeManualEditCount.count);
  expect(duringManualEditCount.id).toBe(textNodeId);

  const duringManualEditBox = await textNode.boundingBox();
  expect(duringManualEditBox).not.toBeNull();
  expect(beforeManualEditBox).not.toBeNull();
  expect(Math.abs((duringManualEditBox?.x ?? 0) - (beforeManualEditBox?.x ?? 0))).toBeLessThan(1);
  expect(Math.abs((duringManualEditBox?.y ?? 0) - (beforeManualEditBox?.y ?? 0))).toBeLessThan(1);

  const beforeArrowX = await readCanonicalLayoutX(page, textNodeId);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(50);
  expect(await readCanonicalLayoutX(page, textNodeId)).toBe(beforeArrowX);
  await expect(inlineEditor).toBeVisible();

  await page.keyboard.type(' updated');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(inlineEditor).toHaveCount(0);

  await expect.poll(readSelectionSnapshot).toMatchObject({
    primary: textNodeId,
    type: 'text',
    parentId: frameId,
    content: 'Creator text updated',
  });
  await expect
    .poll(async () => await readTextNodeByParent(frameId))
    .toEqual({
      count: 1,
      id: textNodeId,
      parentId: frameId,
      content: 'Creator text updated',
      x: expect.any(Number),
      y: expect.any(Number),
    });

  await textNode.dblclick({ force: true });
  await expect(inlineEditor).toBeVisible();
  await expect(inlineEditor).toHaveValue('Creator text updated');
  await page.keyboard.type(' cancelled');
  await page.keyboard.press('Escape');
  await expect(inlineEditor).toHaveCount(0);

  await expect.poll(readSelectionSnapshot).toMatchObject({
    primary: textNodeId,
    type: 'text',
    parentId: frameId,
    content: 'Creator text updated',
  });
  await expect
    .poll(async () => await readTextNodeByParent(frameId))
    .toEqual({
      count: 1,
      id: textNodeId,
      parentId: frameId,
      content: 'Creator text updated',
      x: expect.any(Number),
      y: expect.any(Number),
    });

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect.poll(readSelectionSnapshot).toMatchObject({
    primary: textNodeId,
    type: 'text',
    parentId: frameId,
    content: 'Creator text',
  });

  await page.getByRole('button', { name: 'Redo' }).click();
  await expect.poll(readSelectionSnapshot).toMatchObject({
    primary: textNodeId,
    type: 'text',
    parentId: frameId,
    content: 'Creator text updated',
  });

  const beforeFrameMove = await frameNode.boundingBox();
  const beforeTextMove = await textNode.boundingBox();
  expect(beforeFrameMove).not.toBeNull();
  expect(beforeTextMove).not.toBeNull();

  await ensureNodeSelected(page, frameNode, { position: { x: 16, y: 16 } });
  await dragNode(page, frameNode, { x: 84, y: 60 });
  await waitForMoved(frameNode, beforeFrameMove, { dx: 30, dy: 20 });
  await waitForMoved(textNode, beforeTextMove, { dx: 30, dy: 20 });

  await expect
    .poll(async () => await readTextNodeByParent(frameId))
    .toEqual({
      count: 1,
      id: textNodeId,
      parentId: frameId,
      content: 'Creator text updated',
      x: expect.any(Number),
      y: expect.any(Number),
    });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace uiux text existing-node inline edit survives reload and reopens canonical content on the same node', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoCreateAuthoringWorkspace(page);

  const frameId = await page.evaluate(() => globalThis.__droppleDispatcher?.getState?.()?.selection?.primary ?? null);
  expect(frameId).toBeTruthy();
  const frameNode = visibleNodeById(page, frameId);
  await ensureNodeSelected(page, frameNode);

  await activateTool(page, 'text');
  const frameBox = await frameNode.boundingBox();
  if (!frameBox) throw new Error('Selected frame did not render for reload text edit test');
  await page.mouse.click(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        return Object.values(state?.document?.sceneGraph?.nodes ?? {}).filter((node) => node?.type === 'text').length;
      }),
    )
    .toBe(1);

  const inlineEditor = page.getByTestId('inline-text-editor');
  await expect(inlineEditor).toBeVisible();
  await page.keyboard.type('Persisted manual text');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(inlineEditor).toHaveCount(0);

  const createdTextNode = await page.evaluate((parentId) => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const nodes = Object.values(state?.document?.sceneGraph?.nodes ?? {});
    const entry = nodes.find((node) => node?.type === 'text' && node?.parentId === parentId);
    return entry
      ? {
          id: entry.id,
          parentId: entry.parentId ?? null,
          content: entry.content ?? null,
        }
      : null;
  }, frameId);
  expect(createdTextNode?.id).toBeTruthy();
  expect(createdTextNode?.parentId).toBe(frameId);
  expect(createdTextNode?.content).toBe('Persisted manual text');

  await page.reload({ waitUntil: 'networkidle' });
  await expectSingleVisibleCanvasHost(page);

  const restoredTextNode = await expect
    .poll(async () =>
      page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const nodes = Object.values(state?.document?.sceneGraph?.nodes ?? {});
        const entry = nodes.find((node) => node?.type === 'text' && node?.content === 'Persisted manual text');
        return entry
          ? {
              id: entry.id,
              parentId: entry.parentId ?? null,
              content: entry.content ?? null,
            }
          : null;
      }),
    )
    .toEqual({
      id: expect.any(String),
      parentId: frameId,
      content: 'Persisted manual text',
    })
    .then(() =>
      page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const nodes = Object.values(state?.document?.sceneGraph?.nodes ?? {});
        const entry = nodes.find((node) => node?.type === 'text' && node?.content === 'Persisted manual text');
        return entry
          ? {
              id: entry.id,
              parentId: entry.parentId ?? null,
              content: entry.content ?? null,
            }
          : null;
      }),
    );

  const restoredTextNodeById = visibleNodeById(page, restoredTextNode.id);
  await expect(restoredTextNodeById).toBeVisible();

  const restoredContent = restoredTextNodeById.getByTestId('text-node-content');
  await expect(restoredContent).toContainText('Persisted manual text');
  const restoredBoxBeforeEdit = await restoredTextNodeById.boundingBox();
  if (!restoredBoxBeforeEdit) throw new Error('Restored text node did not render for reload inline edit');
  await page.mouse.dblclick(
    restoredBoxBeforeEdit.x + restoredBoxBeforeEdit.width / 2,
    restoredBoxBeforeEdit.y + restoredBoxBeforeEdit.height / 2,
  );
  await expect(inlineEditor).toBeVisible();
  await expect(inlineEditor).toHaveValue('Persisted manual text');
  await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        return {
          primary: state?.selection?.primary ?? null,
          content: state?.document?.sceneGraph?.nodes?.[nodeId]?.content ?? null,
        };
      }, restoredTextNode.id),
    )
    .toEqual({
      primary: restoredTextNode.id,
      content: 'Persisted manual text',
    });

  await page.keyboard.type(' reopened');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(inlineEditor).toHaveCount(0);

  const restoredBoxAfterEdit = await restoredTextNodeById.boundingBox();
  expect(restoredBoxBeforeEdit).not.toBeNull();
  expect(restoredBoxAfterEdit).not.toBeNull();
  expect(Math.abs((restoredBoxAfterEdit?.x ?? 0) - (restoredBoxBeforeEdit?.x ?? 0))).toBeLessThan(1);
  expect(Math.abs((restoredBoxAfterEdit?.y ?? 0) - (restoredBoxBeforeEdit?.y ?? 0))).toBeLessThan(1);

  await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const node = state?.document?.sceneGraph?.nodes?.[nodeId] ?? null;
        const texts = Object.values(state?.document?.sceneGraph?.nodes ?? {}).filter(
          (entry) => entry?.type === 'text' && entry?.parentId === node?.parentId,
        );
        return {
          id: node?.id ?? null,
          parentId: node?.parentId ?? null,
          content: node?.content ?? null,
          selectionPrimary: state?.selection?.primary ?? null,
          siblingTextCount: texts.length,
        };
      }, restoredTextNode.id),
    )
    .toEqual({
      id: restoredTextNode.id,
      parentId: frameId,
      content: 'Persisted manual text reopened',
      selectionPrimary: restoredTextNode.id,
      siblingTextCount: 1,
    });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace uiux text create-commit keeps canonical selection ids aligned with the selected text node', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoCreateAuthoringWorkspace(page);

  const initialNodeCount = await page.locator('[data-node-id]:visible').count();
  await createFrame(page, { x: 220, y: 180 }, { x: 380, y: 320 });
  await waitForNodeCount(page, initialNodeCount + 1);

  const frameId = await page.evaluate(() => globalThis.__droppleDispatcher?.getState?.()?.selection?.primary ?? null);
  expect(frameId).toBeTruthy();
  const frameNode = visibleNodeById(page, frameId);
  await ensureNodeSelected(page, frameNode);

  await activateTool(page, 'text');
  const frameBox = await frameNode.boundingBox();
  if (!frameBox) throw new Error('Selected frame did not render for selection lawfulness test');
  await page.mouse.click(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2);
  await waitForNodeCount(page, initialNodeCount + 2);

  const inlineEditor = page.getByTestId('inline-text-editor');
  await expect(inlineEditor).toBeVisible();
  await page.keyboard.type('Selection law');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(inlineEditor).toHaveCount(0);

  const textNode = await expect
    .poll(async () =>
      page.evaluate((parentId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const nodes = Object.values(state?.document?.sceneGraph?.nodes ?? {});
        const entry = nodes.find((node) => node?.type === 'text' && node?.parentId === parentId);
        return entry
          ? {
              id: entry.id,
              parentId: entry.parentId ?? null,
              content: entry.content ?? null,
            }
          : null;
      }, frameId),
    )
    .toEqual({
      id: expect.any(String),
      parentId: frameId,
      content: 'Selection law',
    })
    .then(() =>
      page.evaluate((parentId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const nodes = Object.values(state?.document?.sceneGraph?.nodes ?? {});
        const entry = nodes.find((node) => node?.type === 'text' && node?.parentId === parentId);
        return entry
          ? {
              id: entry.id,
              parentId: entry.parentId ?? null,
              content: entry.content ?? null,
            }
          : null;
      }, frameId),
    );

  await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const ids =
          state?.selection?.ids instanceof Set
            ? Array.from(state.selection.ids)
            : Array.isArray(state?.selection?.ids)
              ? [...state.selection.ids]
              : [];
        return {
          primary: state?.selection?.primary ?? null,
          ids,
          content: state?.document?.sceneGraph?.nodes?.[nodeId]?.content ?? null,
        };
      }, textNode.id),
    )
    .toEqual({
      primary: textNode.id,
      ids: [textNode.id],
      content: 'Selection law',
    });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace uiux text inspector updates live text typography and appearance on the creator route', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoCreateAuthoringWorkspace(page);

  const initialNodeCount = await page.locator('[data-node-id]:visible').count();
  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  await waitForNodeCount(page, initialNodeCount + 1);

  const readPrimaryNode = async () =>
    page.evaluate(() => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const primary = state?.selection?.primary ?? null;
      const node = primary ? state?.document?.sceneGraph?.nodes?.[primary] ?? null : null;
      return {
        primary,
        type: node?.type ?? null,
        parentId: node?.parentId ?? null,
      };
    });

  await expect
    .poll(async () => await readPrimaryNode(), { timeout: 10000 })
    .toMatchObject({ primary: expect.any(String) });

  const frameId = (await readPrimaryNode()).primary;
  const frameNode = visibleNodeById(page, frameId);
  await expect(frameNode).toBeVisible();
  await ensureNodeSelected(page, frameNode);

  await activateTool(page, 'text');
  const frameBox = await frameNode.boundingBox();
  if (!frameBox) throw new Error('Selected frame did not render for text styling test');
  await page.mouse.click(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2);
  await waitForNodeCount(page, initialNodeCount + 2);

  const inlineEditor = page.getByTestId('inline-text-editor');
  await expect(inlineEditor).toBeVisible();
  await page.keyboard.type('Styled text that can be formatted inside the box');
  await frameNode.click({ force: true, position: { x: 16, y: 16 } });
  await expect(inlineEditor).toHaveCount(0);

  const textNodeInfo = await page.evaluate((parentId) => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const nodes = state?.document?.sceneGraph?.nodes ?? {};
    const entry = Object.values(nodes).find((node) => node?.type === 'text' && node?.parentId === parentId);
    return entry
      ? {
          id: entry.id,
          parentId: entry.parentId ?? null,
        }
      : null;
  }, frameId);
  expect(textNodeInfo?.id).toBeTruthy();

  const textNode = visibleNodeById(page, textNodeInfo.id);
  await expect(textNode).toBeVisible();
  await ensureNodeSelected(page, textNode);

  const textContent = textNode.getByTestId('text-node-content');
  await expect(textContent).toBeVisible();
  await expect(textContent).toContainText('Styled text that can be formatted inside the box');

  await page.getByTestId('text-font-size-input').fill('28');
  await page.getByTestId('text-font-family-select').selectOption('monospace');
  await page.getByTestId('text-font-weight-select').selectOption('900');
  await page.getByTestId('text-font-style-select').selectOption('oblique');
  await page.getByTestId('text-decoration-select').selectOption('underline');
  await page.getByTestId('text-transform-select').selectOption('uppercase');
  await page.getByTestId('text-align-select').selectOption('justify');
  await page.getByTestId('text-vertical-align-select').selectOption('bottom');
  await page.getByTestId('text-wrap-select').selectOption('nowrap');
  await page.getByTestId('text-color-input').fill('#ff0000');

  await expect
    .poll(async () =>
      textContent.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          textDecorationLine: style.textDecorationLine,
          textTransform: style.textTransform,
          whiteSpace: style.whiteSpace,
          textAlign: style.textAlign,
          alignItems: style.alignItems,
          color: style.color,
        };
      }),
    )
    .toEqual({
      fontFamily: 'monospace',
      fontSize: '28px',
      fontWeight: '900',
      fontStyle: 'italic',
      textDecorationLine: 'underline',
      textTransform: 'uppercase',
      whiteSpace: 'pre',
      textAlign: 'justify',
      alignItems: 'flex-end',
      color: 'rgb(255, 0, 0)',
    });

  await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const node = state?.document?.sceneGraph?.nodes?.[nodeId] ?? null;
        return {
          fontFamily: node?.style?.fontFamily ?? null,
          fontSize: node?.style?.fontSize ?? null,
          fontWeight: node?.style?.fontWeight ?? null,
          fontStyle: node?.style?.fontStyle ?? null,
          textDecorationLine: node?.style?.textDecorationLine ?? null,
          textTransform: node?.style?.textTransform ?? null,
          fill: node?.style?.fill ?? null,
          align: node?.props?.content?.align ?? null,
          verticalAlign: node?.props?.content?.verticalAlign ?? null,
          wrap: node?.props?.content?.wrap ?? null,
        };
      }, textNodeInfo.id),
    )
    .toEqual({
      fontFamily: 'monospace',
      fontSize: 28,
      fontWeight: 900,
      fontStyle: 'oblique',
      textDecorationLine: 'underline',
      textTransform: 'uppercase',
      fill: '#ff0000',
      align: 'justify',
      verticalAlign: 'bottom',
      wrap: false,
    });

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect
    .poll(async () =>
      page.evaluate((nodeId) => globalThis.__droppleDispatcher?.getState?.()?.document?.sceneGraph?.nodes?.[nodeId]?.style?.fill ?? null, textNodeInfo.id),
    )
    .not.toBe('#ff0000');

  await page.getByRole('button', { name: 'Redo' }).click();
  await expect
    .poll(async () =>
      page.evaluate((nodeId) => globalThis.__droppleDispatcher?.getState?.()?.document?.sceneGraph?.nodes?.[nodeId]?.style?.fill ?? null, textNodeInfo.id),
    )
    .toBe('#ff0000');

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace uiux text node supports direct movement and box resize on the creator route', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoCreateAuthoringWorkspace(page);

  const initialNodeCount = await page.locator('[data-node-id]:visible').count();
  await createFrame(page, { x: 220, y: 180 }, { x: 420, y: 340 });
  await waitForNodeCount(page, initialNodeCount + 1);

  const frameId = await page.evaluate(() => globalThis.__droppleDispatcher?.getState?.()?.selection?.primary ?? null);
  expect(frameId).toBeTruthy();
  const frameNode = visibleNodeById(page, frameId);
  await ensureNodeSelected(page, frameNode);

  await activateTool(page, 'text');
  const frameBox = await frameNode.boundingBox();
  if (!frameBox) throw new Error('Selected frame did not render for text geometry test');
  await page.mouse.click(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2);
  await waitForNodeCount(page, initialNodeCount + 2);

  const inlineEditor = page.getByTestId('inline-text-editor');
  await expect(inlineEditor).toBeVisible();
  await page.keyboard.type('Resizable text box');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(inlineEditor).toHaveCount(0);

  const textNodeId = await page.evaluate((parentId) => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const nodes = state?.document?.sceneGraph?.nodes ?? {};
    const entry = Object.values(nodes).find((node) => node?.type === 'text' && node?.parentId === parentId);
    return entry?.id ?? null;
  }, frameId);
  expect(textNodeId).toBeTruthy();

  const textNode = visibleNodeById(page, textNodeId);
  await expect(textNode).toBeVisible();
  await ensureNodeSelected(page, textNode);

  const beforeMove = await textNode.boundingBox();
  expect(beforeMove).not.toBeNull();
  await dragNode(page, textNode, { x: 72, y: 40 });
  await waitForMoved(textNode, beforeMove, { dx: 20, dy: 12 });

  const resizeHandle = page.getByTestId('resize-handle').first();
  await expect(resizeHandle).toBeVisible();
  const beforeResize = await textNode.boundingBox();
  expect(beforeResize).not.toBeNull();
  await dragResizeHandle(page, resizeHandle, { x: 48, y: 24 });
  await waitForResized(textNode, beforeResize, { dw: 16, dh: 8 });

  await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const layout =
          state?.document?.layout?.nodes?.[nodeId] ??
          state?.document?.sceneGraph?.nodes?.[nodeId]?.layout ??
          null;
        return layout
          ? {
              width: layout.width ?? null,
              height: layout.height ?? null,
            }
          : null;
      }, textNodeId),
    )
    .toMatchObject({
      width: expect.any(Number),
      height: expect.any(Number),
    });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace uiux text width mode supports auto width and fixed-width reflow on the creator route', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoCreateAuthoringWorkspace(page);

  const initialNodeCount = await page.locator('[data-node-id]:visible').count();
  await createFrame(page, { x: 220, y: 180 }, { x: 420, y: 340 });
  await waitForNodeCount(page, initialNodeCount + 1);

  const frameId = await page.evaluate(() => globalThis.__droppleDispatcher?.getState?.()?.selection?.primary ?? null);
  expect(frameId).toBeTruthy();
  const frameNode = visibleNodeById(page, frameId);
  await ensureNodeSelected(page, frameNode);

  await activateTool(page, 'text');
  const frameBox = await frameNode.boundingBox();
  if (!frameBox) throw new Error('Selected frame did not render for text width-mode test');
  await page.mouse.click(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2);
  await waitForNodeCount(page, initialNodeCount + 2);

  const inlineEditor = page.getByTestId('inline-text-editor');
  await expect(inlineEditor).toBeVisible();
  await page.keyboard.type('A long line of text that should expand and then reflow when the box becomes fixed width.');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(inlineEditor).toHaveCount(0);

  const textNodeId = await page.evaluate((parentId) => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const nodes = state?.document?.sceneGraph?.nodes ?? {};
    const entry = Object.values(nodes).find((node) => node?.type === 'text' && node?.parentId === parentId);
    return entry?.id ?? null;
  }, frameId);
  expect(textNodeId).toBeTruthy();

  await expect(page.locator(`[data-selection-primary="true"][data-selection-node-id="${textNodeId}"]`)).toHaveCount(1);
  const textNode = visibleNodeById(page, textNodeId);

  await page.getByTestId('text-sizing-mode-select').selectOption('auto-width');

  const autoWidthLayout = await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const node = state?.document?.sceneGraph?.nodes?.[nodeId] ?? null;
        const layout = state?.document?.layout?.nodes?.[nodeId] ?? node?.layout ?? null;
        return {
          sizingMode: node?.props?.content?.sizingMode ?? null,
          wrap: node?.props?.content?.wrap ?? null,
          width: layout?.width ?? null,
          height: layout?.height ?? null,
        };
      }, textNodeId),
    )
    .toMatchObject({
      sizingMode: 'auto-width',
      wrap: false,
      width: expect.any(Number),
      height: expect.any(Number),
    })
    .then(() =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const node = state?.document?.sceneGraph?.nodes?.[nodeId] ?? null;
        const layout = state?.document?.layout?.nodes?.[nodeId] ?? node?.layout ?? null;
        return {
          width: layout?.width ?? null,
          height: layout?.height ?? null,
        };
      }, textNodeId),
    );

  expect(autoWidthLayout.width).toBeGreaterThan(140);

  await page.getByTestId('text-sizing-mode-select').selectOption('fixed-width');
  await page.getByTestId('text-wrap-select').selectOption('wrap');
  await page.getByTestId('layout-width-input').fill('140');

  await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const node = state?.document?.sceneGraph?.nodes?.[nodeId] ?? null;
        const layout = state?.document?.layout?.nodes?.[nodeId] ?? node?.layout ?? null;
        return {
          sizingMode: node?.props?.content?.sizingMode ?? null,
          wrap: node?.props?.content?.wrap ?? null,
          width: layout?.width ?? null,
          height: layout?.height ?? null,
        };
      }, textNodeId),
    )
    .toMatchObject({
      sizingMode: 'fixed-width',
      wrap: true,
      width: 140,
      height: expect.any(Number),
    });

  await expect
    .poll(async () =>
      page.evaluate((nodeId) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const layout =
          state?.document?.layout?.nodes?.[nodeId] ??
          state?.document?.sceneGraph?.nodes?.[nodeId]?.layout ??
          null;
        return layout?.height ?? null;
      }, textNodeId),
    )
    .toBeGreaterThan(autoWidthLayout.height);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace uiux text content and styling persist across reload on the creator route', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoCreateAuthoringWorkspace(page);

  const initialNodeCount = await page.locator('[data-node-id]:visible').count();
  await createFrame(page, { x: 220, y: 180 }, { x: 420, y: 340 });
  await waitForNodeCount(page, initialNodeCount + 1);

  const frameId = await page.evaluate(() => globalThis.__droppleDispatcher?.getState?.()?.selection?.primary ?? null);
  expect(frameId).toBeTruthy();
  const frameNode = visibleNodeById(page, frameId);
  await ensureNodeSelected(page, frameNode);

  await activateTool(page, 'text');
  const frameBox = await frameNode.boundingBox();
  if (!frameBox) throw new Error('Selected frame did not render for persistence test');
  await page.mouse.click(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2);
  await waitForNodeCount(page, initialNodeCount + 2);

  const inlineEditor = page.getByTestId('inline-text-editor');
  await expect(inlineEditor).toBeVisible();
  await page.keyboard.type('Persisted text');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(inlineEditor).toHaveCount(0);

  const textNodeId = await page.evaluate((parentId) => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    const nodes = state?.document?.sceneGraph?.nodes ?? {};
    const entry = Object.values(nodes).find((node) => node?.type === 'text' && node?.parentId === parentId);
    return entry?.id ?? null;
  }, frameId);
  expect(textNodeId).toBeTruthy();

  const textNode = visibleNodeById(page, textNodeId);
  await expect(page.locator(`[data-selection-primary="true"][data-selection-node-id="${textNodeId}"]`)).toHaveCount(1);

  await page.getByTestId('text-font-size-input').fill('24');
  await page.getByTestId('text-font-weight-select').selectOption('600');
  await page.getByTestId('text-color-input').fill('#ff0000');

  await page.reload({ waitUntil: 'networkidle' });
  await expectSingleVisibleCanvasHost(page);

  const restoredTextNodeId = await expect
    .poll(async () =>
      page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const nodes = state?.document?.sceneGraph?.nodes ?? {};
        const entry = Object.values(nodes).find((node) => node?.type === 'text' && node?.content === 'Persisted text');
        return entry?.id ?? null;
      }),
    )
    .toBeTruthy()
    .then(() =>
      page.evaluate(() => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const nodes = state?.document?.sceneGraph?.nodes ?? {};
        const entry = Object.values(nodes).find((node) => node?.type === 'text' && node?.content === 'Persisted text');
        return entry?.id ?? null;
      }),
    );

  const restoredTextNode = visibleNodeById(page, restoredTextNodeId);
  await expect(restoredTextNode).toBeVisible();
  const restoredContent = restoredTextNode.getByTestId('text-node-content');
  await expect(restoredContent).toContainText('Persisted text');

  await expect
    .poll(async () =>
      restoredContent.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.color,
        };
      }),
    )
    .toEqual({
      fontSize: '24px',
      fontWeight: '600',
      color: 'rgb(255, 0, 0)',
    });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudge and shift-nudge move selected node with preserved identity', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = visibleNodeLocator(page);
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

test('workspace new keyboard align-left shortcut is deterministic and undo-redo lawful', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 140, y: 180 }, { x: 280, y: 300 });
  await createFrame(page, { x: 340, y: 240 }, { x: 500, y: 360 });
  const nodes = visibleNodeLocators(page);
  await expect(nodes).toHaveCount(2);

  const first = nodes.nth(0);
  const second = nodes.nth(1);

  await activateTool(page, 'select');
  await first.click({ force: true });
  await page.keyboard.down('Shift');
  await second.click({ force: true });
  await page.keyboard.up('Shift');
  await expect(page.getByTestId('selection-outline')).toHaveCount(2);

  const [idA, idB] = await Promise.all([
    first.getAttribute('data-node-id'),
    second.getAttribute('data-node-id'),
  ]);
  expect(idA).toBeTruthy();
  expect(idB).toBeTruthy();

  const readLayoutPair = async () =>
    page.evaluate((ids) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const nodesById = state?.document?.layout?.nodes ?? {};
      const selectionIds = state?.runtime?.selection?.ids ?? state?.selection?.ids ?? [];
      const selectionCount = Array.isArray(selectionIds) ? selectionIds.length : selectionIds?.size ?? 0;
      return {
        values: ids.map((id) => {
          const node = nodesById[id];
          if (!node) return null;
          return { x: node.x ?? 0, y: node.y ?? 0 };
        }),
        selectionCount,
      };
    }, [idA, idB]);

  await expect
    .poll(async () => (await readLayoutPair()).selectionCount)
    .toBeGreaterThan(1);
  await expect
    .poll(async () => {
      const { values } = await readLayoutPair();
      const [a, b] = values;
      if (!a || !b) return null;
      return a.x !== b.x;
    })
    .toBe(true);

  await triggerAlignmentShortcut(page, 'ArrowLeft');
  await expect
    .poll(async () => {
      const { values } = await readLayoutPair();
      const [a, b] = values;
      if (!a || !b) return null;
      return a.x === b.x;
    })
    .toBe(true);

  let undoObserved = false;
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() => globalThis.__droppleDispatcher?.undo?.());
    const { values } = await readLayoutPair();
    const [a, b] = values;
    if (a && b && a.x !== b.x) {
      undoObserved = true;
      break;
    }
  }
  expect(undoObserved).toBe(true);

  let redoObserved = false;
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() => globalThis.__droppleDispatcher?.redo?.());
    const { values } = await readLayoutPair();
    const [a, b] = values;
    if (a && b && a.x === b.x) {
      redoObserved = true;
      break;
    }
  }
  expect(redoObserved).toBe(true);

  await clearSelectionFromCanvas(page);
  await expect(page.getByTestId('selection-outline')).toHaveCount(0);
  await first.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  const beforeSingle = await readLayoutPair();
  await triggerAlignmentShortcut(page, 'ArrowRight');
  const afterSingle = await readLayoutPair();
  expect(afterSingle.values).toEqual(beforeSingle.values);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard distribute-x shortcut is deterministic and undo-redo lawful', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  const beforeIds = await page.evaluate(() =>
    Array.from(
      new Set(
        Array.from(document.querySelectorAll('[data-node-id]'))
          .map((el) => el.getAttribute('data-node-id'))
          .filter(Boolean)
      )
    )
  );

  await createFrame(page, { x: 120, y: 180 }, { x: 220, y: 280 });
  await createFrame(page, { x: 320, y: 180 }, { x: 420, y: 280 });
  await createFrame(page, { x: 560, y: 180 }, { x: 660, y: 280 });
  const nodes = visibleNodeLocators(page);
  await expect(nodes).toHaveCount(beforeIds.length + 3);

  const createdIds = await page.evaluate((existingIds) => {
    const existing = new Set(existingIds);
    return Array.from(
      new Set(
        Array.from(document.querySelectorAll('[data-node-id]'))
          .map((el) => el.getAttribute('data-node-id'))
          .filter((id) => id && !existing.has(id))
      )
    );
  }, beforeIds);
  expect(createdIds).toHaveLength(3);

  const [idA, idB, idC] = createdIds;
  const first = visibleNodeById(page, idA);
  const second = visibleNodeById(page, idB);
  const third = visibleNodeById(page, idC);

  await activateTool(page, 'select');
  await first.click({ force: true });
  await page.keyboard.down('Shift');
  await second.click({ force: true });
  await third.click({ force: true });
  await page.keyboard.up('Shift');
  await expect(page.getByTestId('selection-outline')).toHaveCount(3);
  await waitForRuntimeSelectionCount(page, 3);

  const readLayoutTriple = async () =>
    page.evaluate((ids) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const nodesById = state?.document?.layout?.nodes ?? {};
      return ids.map((id) => {
        const node = nodesById[id];
        if (!node) return null;
        return {
          x: node.x ?? 0,
          y: node.y ?? 0,
          width: node.width ?? 0,
        };
      });
    }, [idA, idB, idC]);

  const computeHorizontalGaps = (values) => {
    const ordered = [...values].filter(Boolean).sort((a, b) => a.x - b.x);
    const [a, b, c] = ordered;
    if (!a || !b || !c) return null;
    const gapAB = b.x - (a.x + a.width);
    const gapBC = c.x - (b.x + b.width);
    return { gapAB, gapBC };
  };

  await expect
    .poll(async () => {
      const gaps = computeHorizontalGaps(await readLayoutTriple());
      if (!gaps) return null;
      return Math.round(gaps.gapAB) !== Math.round(gaps.gapBC);
    })
    .toBe(true);

  await triggerAlignmentShortcut(page, 'ArrowRight', { shift: true });
  await expect
    .poll(async () => {
      const gaps = computeHorizontalGaps(await readLayoutTriple());
      if (!gaps) return null;
      return Math.abs(gaps.gapAB - gaps.gapBC) < 0.001;
    })
    .toBe(true);

  let undoObserved = false;
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() => globalThis.__droppleDispatcher?.undo?.());
    const gaps = computeHorizontalGaps(await readLayoutTriple());
    if (gaps && Math.round(gaps.gapAB) !== Math.round(gaps.gapBC)) {
      undoObserved = true;
      break;
    }
  }
  expect(undoObserved).toBe(true);

  let redoObserved = false;
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() => globalThis.__droppleDispatcher?.redo?.());
    const gaps = computeHorizontalGaps(await readLayoutTriple());
    if (gaps && Math.abs(gaps.gapAB - gaps.gapBC) < 0.001) {
      redoObserved = true;
      break;
    }
  }
  expect(redoObserved).toBe(true);

  await clearSelectionFromCanvas(page);
  await expect(page.getByTestId('selection-outline')).toHaveCount(0);
  await first.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  const beforeSingle = await readLayoutTriple();
  await triggerAlignmentShortcut(page, 'ArrowRight', { shift: true });
  const afterSingle = await readLayoutTriple();
  expect(afterSingle).toEqual(beforeSingle);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard distribute-y shortcut is deterministic and undo-redo lawful', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  const beforeIds = await page.evaluate(() =>
    Array.from(
      new Set(
        Array.from(document.querySelectorAll('[data-node-id]'))
          .map((el) => el.getAttribute('data-node-id'))
          .filter(Boolean)
      )
    )
  );

  await createFrame(page, { x: 180, y: 120 }, { x: 300, y: 200 });
  await createFrame(page, { x: 180, y: 320 }, { x: 300, y: 400 });
  await createFrame(page, { x: 180, y: 560 }, { x: 300, y: 640 });
  const nodes = visibleNodeLocators(page);
  await expect(nodes).toHaveCount(beforeIds.length + 3);

  const createdIds = await page.evaluate((existingIds) => {
    const existing = new Set(existingIds);
    return Array.from(
      new Set(
        Array.from(document.querySelectorAll('[data-node-id]'))
          .map((el) => el.getAttribute('data-node-id'))
          .filter((id) => id && !existing.has(id))
      )
    );
  }, beforeIds);
  expect(createdIds).toHaveLength(3);

  const [idA, idB, idC] = createdIds;
  const first = visibleNodeById(page, idA);
  const second = visibleNodeById(page, idB);
  const third = visibleNodeById(page, idC);

  await activateTool(page, 'select');
  await first.click({ force: true });
  await page.keyboard.down('Shift');
  await second.click({ force: true });
  await third.click({ force: true });
  await page.keyboard.up('Shift');
  await expect(page.getByTestId('selection-outline')).toHaveCount(3);
  await waitForRuntimeSelectionCount(page, 3);

  const readLayoutTriple = async () =>
    page.evaluate((ids) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const nodesById = state?.document?.layout?.nodes ?? {};
      return ids.map((id) => {
        const node = nodesById[id];
        if (!node) return null;
        return {
          x: node.x ?? 0,
          y: node.y ?? 0,
          height: node.height ?? 0,
        };
      });
    }, [idA, idB, idC]);

  const computeVerticalGaps = (values) => {
    const ordered = [...values].filter(Boolean).sort((a, b) => a.y - b.y);
    const [a, b, c] = ordered;
    if (!a || !b || !c) return null;
    const gapAB = b.y - (a.y + a.height);
    const gapBC = c.y - (b.y + b.height);
    return { gapAB, gapBC };
  };

  await expect
    .poll(async () => {
      const gaps = computeVerticalGaps(await readLayoutTriple());
      if (!gaps) return null;
      return Math.round(gaps.gapAB) !== Math.round(gaps.gapBC);
    })
    .toBe(true);

  await triggerAlignmentShortcut(page, 'ArrowDown', { shift: true });
  await expect
    .poll(async () => {
      const gaps = computeVerticalGaps(await readLayoutTriple());
      if (!gaps) return null;
      return Math.abs(gaps.gapAB - gaps.gapBC) < 0.001;
    })
    .toBe(true);

  let undoObserved = false;
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() => globalThis.__droppleDispatcher?.undo?.());
    const gaps = computeVerticalGaps(await readLayoutTriple());
    if (gaps && Math.round(gaps.gapAB) !== Math.round(gaps.gapBC)) {
      undoObserved = true;
      break;
    }
  }
  expect(undoObserved).toBe(true);

  let redoObserved = false;
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() => globalThis.__droppleDispatcher?.redo?.());
    const gaps = computeVerticalGaps(await readLayoutTriple());
    if (gaps && Math.abs(gaps.gapAB - gaps.gapBC) < 0.001) {
      redoObserved = true;
      break;
    }
  }
  expect(redoObserved).toBe(true);

  await clearSelectionFromCanvas(page);
  await expect(page.getByTestId('selection-outline')).toHaveCount(0);
  await first.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  const beforeSingle = await readLayoutTriple();
  await triggerAlignmentShortcut(page, 'ArrowDown', { shift: true });
  const afterSingle = await readLayoutTriple();
  expect(afterSingle).toEqual(beforeSingle);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard distribute-y is inert for low selection cardinality and focused text inputs', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 180, y: 120 }, { x: 300, y: 200 });
  await createFrame(page, { x: 180, y: 320 }, { x: 300, y: 400 });
  await createFrame(page, { x: 180, y: 560 }, { x: 300, y: 640 });
  const nodes = visibleNodeLocators(page);
  await expect(nodes).toHaveCount(3);

  const first = nodes.nth(0);
  const second = nodes.nth(1);

  await activateTool(page, 'select');
  await first.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);

  const [idA, idB] = await Promise.all([
    first.getAttribute('data-node-id'),
    second.getAttribute('data-node-id'),
  ]);
  expect(idA).toBeTruthy();
  expect(idB).toBeTruthy();

  const readLayoutPair = async () =>
    page.evaluate((ids) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const nodesById = state?.document?.layout?.nodes ?? {};
      return ids.map((id) => {
        const node = nodesById[id];
        if (!node) return null;
        return {
          x: node.x ?? 0,
          y: node.y ?? 0,
          width: node.width ?? 0,
          height: node.height ?? 0,
        };
      });
    }, [idA, idB]);

  const singleBefore = await readLayoutPair();
  await page.keyboard.press('Control+Shift+ArrowDown');
  const singleAfter = await readLayoutPair();
  expect(singleAfter).toEqual(singleBefore);

  await page.keyboard.down('Shift');
  await second.click({ force: true });
  await page.keyboard.up('Shift');
  await expect(page.getByTestId('selection-outline')).toHaveCount(2);

  const pairBefore = await readLayoutPair();
  await page.keyboard.press('Control+Shift+ArrowDown');
  const pairAfter = await readLayoutPair();
  expect(pairAfter).toEqual(pairBefore);

  await page.evaluate(() => {
    const input = document.createElement('input');
    input.id = 'dropple-test-distribute-input-guard';
    input.value = 'guard';
    document.body.appendChild(input);
    input.focus();
  });
  const inputFocusedBefore = await readLayoutPair();
  await page.keyboard.press('Control+Shift+ArrowDown');
  const inputFocusedAfter = await readLayoutPair();
  expect(inputFocusedAfter).toEqual(inputFocusedBefore);

  await page.evaluate(() => {
    const editable = document.createElement('div');
    editable.id = 'dropple-test-distribute-contenteditable-guard';
    editable.contentEditable = 'true';
    editable.textContent = 'guard';
    document.body.appendChild(editable);
    editable.focus();
  });
  const editableFocusedBefore = await readLayoutPair();
  await page.keyboard.press('Control+Shift+ArrowDown');
  const editableFocusedAfter = await readLayoutPair();
  expect(editableFocusedAfter).toEqual(editableFocusedBefore);

  await page.evaluate(() => {
    document.getElementById('dropple-test-distribute-input-guard')?.remove();
    document.getElementById('dropple-test-distribute-contenteditable-guard')?.remove();
  });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard distribute shortcut aliases remain parity-stable across axes', async ({ page }) => {
  const runFlow = async (distributionKey) => {
    const flowPage = await page.context().newPage();
    await gotoNewWorkspace(flowPage);

    const beforeIds = await flowPage.evaluate(() =>
      Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter(Boolean)
        )
      )
    );

    await createFrame(flowPage, { x: 120, y: 120 }, { x: 220, y: 200 });
    await createFrame(flowPage, { x: 320, y: 280 }, { x: 420, y: 360 });
    await createFrame(flowPage, { x: 560, y: 520 }, { x: 660, y: 600 });
    const nodes = visibleNodeLocators(flowPage);
    await expect(nodes).toHaveCount(beforeIds.length + 3);

    const createdIds = await flowPage.evaluate((existingIds) => {
      const existing = new Set(existingIds);
      return Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter((id) => id && !existing.has(id))
        )
      );
    }, beforeIds);
    expect(createdIds).toHaveLength(3);

    const first = visibleNodeById(flowPage, createdIds[0]);
    const second = visibleNodeById(flowPage, createdIds[1]);
    const third = visibleNodeById(flowPage, createdIds[2]);

    await activateTool(flowPage, 'select');
    await first.click({ force: true });
    await flowPage.keyboard.down('Shift');
    await second.click({ force: true });
    await third.click({ force: true });
    await flowPage.keyboard.up('Shift');
    await expect
      .poll(async () => {
        const selectionCount = await flowPage.evaluate(() => {
          const state = globalThis.__droppleDispatcher?.getState?.();
          const ids = state?.selection?.ids;
          if (Array.isArray(ids)) return ids.length;
          if (ids && typeof ids.size === 'number') return ids.size;
          return 0;
        });
        return selectionCount;
      })
      .toBe(3);

    const [idA, idB, idC] = createdIds;

    const values = await flowPage.evaluate((ids) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const nodesById = state?.document?.layout?.nodes ?? {};
      return ids.map((id) => {
        const node = nodesById[id];
        if (!node) return null;
        return {
          x: node.x ?? 0,
          y: node.y ?? 0,
          width: node.width ?? 0,
          height: node.height ?? 0,
        };
      });
    }, [idA, idB, idC]);
    expect(values.every(Boolean)).toBe(true);

    await triggerAlignmentShortcut(flowPage, distributionKey, {
      shift: true,
      nodeIds: [idA, idB, idC],
    });

    const result = await flowPage.evaluate((ids) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const nodesById = state?.document?.layout?.nodes ?? {};
      const values = ids.map((id) => nodesById[id]).filter(Boolean);
      if (values.length !== 3) return null;

      const xOrdered = [...values].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
      const yOrdered = [...values].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
      const [xa, xb, xc] = xOrdered;
      const [ya, yb, yc] = yOrdered;
      const gapXAB = (xb.x ?? 0) - ((xa.x ?? 0) + (xa.width ?? 0));
      const gapXBC = (xc.x ?? 0) - ((xb.x ?? 0) + (xb.width ?? 0));
      const gapYAB = (yb.y ?? 0) - ((ya.y ?? 0) + (ya.height ?? 0));
      const gapYBC = (yc.y ?? 0) - ((yb.y ?? 0) + (yb.height ?? 0));
      return { gapXAB, gapXBC, gapYAB, gapYBC };
    }, [idA, idB, idC]);
    await flowPage.close();
    return result;
  };

  const right = await runFlow('ArrowRight');
  const left = await runFlow('ArrowLeft');
  const down = await runFlow('ArrowDown');
  const up = await runFlow('ArrowUp');

  expect(right).toBeTruthy();
  expect(left).toBeTruthy();
  expect(down).toBeTruthy();
  expect(up).toBeTruthy();

  expect(Math.abs(right.gapXAB - right.gapXBC)).toBeLessThan(0.001);
  const verticalAliasGapDown = Math.abs(down.gapYAB - down.gapYBC);
  const verticalAliasGapUp = Math.abs(up.gapYAB - up.gapYBC);
  expect(Math.min(verticalAliasGapDown, verticalAliasGapUp)).toBeLessThan(0.001);
  expect(Number.isFinite(left.gapXAB)).toBe(true);
  expect(Number.isFinite(left.gapXBC)).toBe(true);
  expect(Number.isFinite(up.gapYAB)).toBe(true);
  expect(Number.isFinite(up.gapYBC)).toBe(true);

});

test('workspace new keyboard shortcut helper dispatches deterministic align/distribute outcomes', async ({ page }) => {
  const runFlow = async ({ key, shift = false }) => {
    const flowPage = await page.context().newPage();
    await gotoNewWorkspace(flowPage);

    const beforeIds = await flowPage.evaluate(() =>
      Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter(Boolean)
        )
      )
    );

    await createFrame(flowPage, { x: 120, y: 180 }, { x: 220, y: 280 });
    await createFrame(flowPage, { x: 360, y: 240 }, { x: 460, y: 340 });
    await createFrame(flowPage, { x: 580, y: 320 }, { x: 680, y: 420 });

    const nodes = visibleNodeLocators(flowPage);
    await expect(nodes).toHaveCount(beforeIds.length + 3);

    const createdIds = await flowPage.evaluate((existingIds) => {
      const existing = new Set(existingIds);
      return Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter((id) => id && !existing.has(id))
        )
      );
    }, beforeIds);
    expect(createdIds).toHaveLength(3);

    const first = visibleNodeById(flowPage, createdIds[0]);
    const second = visibleNodeById(flowPage, createdIds[1]);
    const third = visibleNodeById(flowPage, createdIds[2]);

    await expect(first).toBeVisible();
    await expect(second).toBeVisible();
    await expect(third).toBeVisible();

    const readSignature = async () =>
      flowPage.evaluate((ids) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const nodesById = state?.document?.layout?.nodes ?? {};
        const values = ids.map((id) => nodesById[id]).filter(Boolean);
        if (values.length !== 3) return null;
        const orderedByX = [...values].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
        const orderedByY = [...values].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
        return JSON.stringify({
          x: orderedByX.map((node) => node.x ?? 0),
          y: orderedByY.map((node) => node.y ?? 0),
        });
      }, createdIds);

    await triggerAlignmentShortcut(flowPage, key, {
      shift,
      nodeIds: createdIds,
    });
    await readSignature();

    const result = await flowPage.evaluate((ids) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const nodesById = state?.document?.layout?.nodes ?? {};
      const values = ids.map((id) => nodesById[id]).filter(Boolean);
      if (values.length !== 3) return null;
      const orderedByX = [...values].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
      const orderedByY = [...values].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
      return {
        x: orderedByX.map((node) => node.x ?? 0),
        y: orderedByY.map((node) => node.y ?? 0),
        widths: orderedByX.map((node) => node.width ?? 0),
      };
    }, createdIds);

    await flowPage.close();
    return result;
  };

  const alignLeft = await runFlow({ key: 'ArrowLeft' });
  expect(alignLeft).toBeTruthy();
  expect(new Set(alignLeft.x).size).toBe(1);

  const distributeX = await runFlow({ key: 'ArrowRight', shift: true });
  expect(distributeX).toBeTruthy();
  const [a, b, c] = distributeX.x;
  const [wa, wb] = distributeX.widths;
  const gapAB = b - (a + wa);
  const gapBC = c - (b + wb);
  expect(Math.abs(gapAB - gapBC)).toBeLessThan(0.001);
});

test('workspace new keyboard align shortcuts are inert while focus is in input or contenteditable', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 140, y: 180 }, { x: 240, y: 280 });
  await createFrame(page, { x: 360, y: 240 }, { x: 460, y: 340 });
  const nodes = visibleNodeLocators(page);
  await expect(nodes).toHaveCount(2);

  const first = nodes.nth(0);
  const second = nodes.nth(1);

  await activateTool(page, 'select');
  await first.click({ force: true });
  await page.keyboard.down('Shift');
  await second.click({ force: true });
  await page.keyboard.up('Shift');
  await expect(page.getByTestId('selection-outline')).toHaveCount(2);
  await waitForRuntimeSelectionCount(page, 2);

  const [idA, idB] = await Promise.all([
    first.getAttribute('data-node-id'),
    second.getAttribute('data-node-id'),
  ]);
  expect(idA).toBeTruthy();
  expect(idB).toBeTruthy();

  const readPair = async () =>
    page.evaluate((ids) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const nodesById = state?.document?.layout?.nodes ?? {};
      return ids.map((id) => {
        const node = nodesById[id];
        if (!node) return null;
        return {
          x: node.x ?? 0,
          y: node.y ?? 0,
          width: node.width ?? 0,
          height: node.height ?? 0,
        };
      });
    }, [idA, idB]);

  await page.evaluate(() => {
    const input = document.createElement('input');
    input.id = 'dropple-test-align-input-guard';
    input.value = 'align-guard';
    document.body.appendChild(input);
    input.focus();
  });
  const inputBefore = await readPair();
  await page.keyboard.press('Control+ArrowLeft');
  await page.keyboard.press('Control+Shift+ArrowRight');
  const inputAfter = await readPair();
  expect(inputAfter).toEqual(inputBefore);

  await page.evaluate(() => {
    const editable = document.createElement('div');
    editable.id = 'dropple-test-align-contenteditable-guard';
    editable.contentEditable = 'true';
    editable.textContent = 'align-guard';
    document.body.appendChild(editable);
    editable.focus();
  });
  const editableBefore = await readPair();
  await page.keyboard.press('Control+ArrowLeft');
  await page.keyboard.press('Control+Shift+ArrowRight');
  const editableAfter = await readPair();
  expect(editableAfter).toEqual(editableBefore);

  await page.evaluate(() => {
    const textarea = document.createElement('textarea');
    textarea.id = 'dropple-test-align-textarea-guard';
    textarea.value = 'align-guard';
    document.body.appendChild(textarea);
    textarea.focus();
  });
  const textareaBefore = await readPair();
  await page.keyboard.press('Control+ArrowLeft');
  await page.keyboard.press('Control+Shift+ArrowRight');
  const textareaAfter = await readPair();
  expect(textareaAfter).toEqual(textareaBefore);

  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'dropple-test-align-overlay-guard';
    overlay.setAttribute('role', 'dialog');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.pointerEvents = 'none';

    const overlayInput = document.createElement('input');
    overlayInput.id = 'dropple-test-align-overlay-input-guard';
    overlayInput.value = 'overlay-input';
    overlayInput.style.pointerEvents = 'auto';

    const overlayEditable = document.createElement('div');
    overlayEditable.id = 'dropple-test-align-overlay-contenteditable-guard';
    overlayEditable.contentEditable = 'true';
    overlayEditable.textContent = 'overlay-editable';
    overlayEditable.style.pointerEvents = 'auto';

    overlay.appendChild(overlayInput);
    overlay.appendChild(overlayEditable);
    document.body.appendChild(overlay);
    overlayInput.focus();
  });
  const overlayInputBefore = await readPair();
  await page.keyboard.press('Control+ArrowLeft');
  await page.keyboard.press('Control+Shift+ArrowRight');
  const overlayInputAfter = await readPair();
  expect(overlayInputAfter).toEqual(overlayInputBefore);

  await page.evaluate(() => {
    document.getElementById('dropple-test-align-overlay-contenteditable-guard')?.focus();
  });
  const overlayEditableBefore = await readPair();
  await page.keyboard.press('Control+ArrowLeft');
  await page.keyboard.press('Control+Shift+ArrowRight');
  const overlayEditableAfter = await readPair();
  expect(overlayEditableAfter).toEqual(overlayEditableBefore);

  await page.evaluate(() => {
    document.getElementById('dropple-test-align-input-guard')?.remove();
    document.getElementById('dropple-test-align-contenteditable-guard')?.remove();
    document.getElementById('dropple-test-align-textarea-guard')?.remove();
    document.getElementById('dropple-test-align-overlay-guard')?.remove();
  });

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new alt-drag duplicate preserves source identity and projection law', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const runFlow = async () => {
    await gotoNewWorkspace(page);
    await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });

    const nodes = visibleNodeLocators(page);
    await expect(nodes).toHaveCount(1);
    const source = nodes.first();
    await expect(source).toBeVisible();

    await activateTool(page, 'select');
    await source.click({ force: true });
    await expect(page.getByTestId('selection-outline')).toHaveCount(1);

    const sourceId = await source.getAttribute('data-node-id');
    expect(sourceId).toBeTruthy();

    const sourceBefore = await source.boundingBox();
    expect(sourceBefore).not.toBeNull();

    await dragNode(page, source, { x: 90, y: 55 }, { holdAlt: true });

    const duplicated = await expect
      .poll(async () => await nodes.count(), {
        timeout: 5000,
      })
      .toBe(2)
      .then(() => true)
      .catch(() => false);
    if (!duplicated) {
      const duplicateDebug = await page.evaluate(() => {
        return document.documentElement.dataset.droppleDuplicateDebug || null;
      });
      const overlayDebug = await page.evaluate(() => {
        return document.documentElement.dataset.droppleOverlayDebug || null;
      });
      throw new Error(
        `Alt-drag duplicate did not create a second node; duplicateDebug=${duplicateDebug}; overlayDebug=${overlayDebug}`
      );
    }
    const duplicateId = await page.evaluate((id) => {
      const ids = Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter(Boolean)
        )
      );
      return ids.find((nodeId) => nodeId !== id) ?? null;
    }, sourceId);
    expect(duplicateId).toBeTruthy();
    const duplicate = visibleNodeById(page, duplicateId);
    await expect(duplicate).toBeVisible();
    expect(duplicateId).not.toBe(sourceId);

    const selectionPrimary = page.locator('[data-selection-primary="true"]');
    await expect(selectionPrimary).toHaveCount(1);
    await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', duplicateId);

    const sourceAfter = visibleNodeById(page, sourceId);
    await expect(sourceAfter).toBeVisible();
    const sourceAfterBox = await sourceAfter.boundingBox();
    expect(sourceAfterBox).not.toBeNull();
    expect(sourceAfterBox.x).toBeCloseTo(sourceBefore.x, 0);
    expect(sourceAfterBox.y).toBeCloseTo(sourceBefore.y, 0);

    const duplicateAfter = await duplicate.boundingBox();
    expect(duplicateAfter).not.toBeNull();
    expect(Math.abs(duplicateAfter.x - sourceAfterBox.x)).toBeGreaterThanOrEqual(30);
    expect(Math.abs(duplicateAfter.y - sourceAfterBox.y)).toBeGreaterThanOrEqual(20);

    return JSON.stringify({
      source: {
        x: Math.round(sourceAfterBox.x),
        y: Math.round(sourceAfterBox.y),
        width: Math.round(sourceAfterBox.width),
        height: Math.round(sourceAfterBox.height),
      },
      duplicate: {
        x: Math.round(duplicateAfter.x),
        y: Math.round(duplicateAfter.y),
        width: Math.round(duplicateAfter.width),
        height: Math.round(duplicateAfter.height),
      },
    });
  };

  const hashA = await runFlow();
  await page.reload({ waitUntil: 'networkidle' });
  const hashB = await runFlow();
  expect(hashB).toBe(hashA);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new alt-drag duplicate on multi-selection keeps sources stable and remains undo-redo lawful', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  await gotoNewWorkspace(page);
  await createFrame(page, { x: 140, y: 180 }, { x: 280, y: 300 });
  await createFrame(page, { x: 320, y: 220 }, { x: 460, y: 340 });

  const nodes = visibleNodeLocators(page);
  await waitForNodeCount(page, 2);

  const sourceA = nodes.nth(0);
  const sourceB = nodes.nth(1);
  await activateTool(page, 'select');
  await sourceA.click({ force: true });
  await page.keyboard.down('Shift');
  await sourceB.click({ force: true });
  await page.keyboard.up('Shift');
  await expect(page.getByTestId('selection-outline')).toHaveCount(2);

  const sourceAId = await sourceA.getAttribute('data-node-id');
  const sourceBId = await sourceB.getAttribute('data-node-id');
  expect(sourceAId).toBeTruthy();
  expect(sourceBId).toBeTruthy();

  const sourceABefore = await page.evaluate((ids) => {
    const out = {};
    ids.forEach((id) => {
      const el = document.querySelector(`[data-node-id="${id}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      out[id] = {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });
    return out;
  }, [sourceAId, sourceBId]);

  await dragNode(page, sourceB, { x: 90, y: 55 }, { holdAlt: true });
  await waitForNodeCount(page, 4);
  await expect(page.getByTestId('selection-outline')).toHaveCount(2);

  const afterDuplicate = await page.evaluate((sourceIds) => {
    const sourceSet = new Set(sourceIds);
    const allIds = Array.from(
      new Set(
        Array.from(document.querySelectorAll('[data-node-id]'))
          .map((el) => el.getAttribute('data-node-id'))
          .filter(Boolean)
      )
    );
    const duplicateIds = allIds.filter((id) => !sourceSet.has(id));
    const primary = document
      .querySelector('[data-selection-primary="true"]')
      ?.getAttribute('data-selection-node-id') ?? null;
    const byId = {};
    allIds.forEach((id) => {
      const el = document.querySelector(`[data-node-id="${id}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      byId[id] = {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });
    return { allIds, duplicateIds, primary, byId };
  }, [sourceAId, sourceBId]);

  expect(afterDuplicate.duplicateIds).toHaveLength(2);
  expect(afterDuplicate.primary).toBeTruthy();
  expect(afterDuplicate.duplicateIds.includes(afterDuplicate.primary)).toBe(true);

  for (const sourceId of [sourceAId, sourceBId]) {
    expect(afterDuplicate.byId[sourceId]).toBeTruthy();
    expect(afterDuplicate.byId[sourceId].x).toBe(sourceABefore[sourceId].x);
    expect(afterDuplicate.byId[sourceId].y).toBe(sourceABefore[sourceId].y);
  }

  const duplicatedSnapshot = await page.evaluate((sourceIds) => {
    const sourceSet = new Set(sourceIds);
    const allIds = Array.from(
      new Set(
        Array.from(document.querySelectorAll('[data-node-id]'))
          .map((el) => el.getAttribute('data-node-id'))
          .filter(Boolean)
      )
    );
    const duplicateIds = allIds.filter((id) => !sourceSet.has(id));
    const byId = {};
    allIds.forEach((id) => {
      const el = document.querySelector(`[data-node-id="${id}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      byId[id] = {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
      };
    });
    return {
      allIds: [...allIds].sort(),
      duplicateIds: [...duplicateIds].sort(),
      byId,
    };
  }, [sourceAId, sourceBId]);

  const undoSteps = 4;
  for (let i = 0; i < undoSteps; i += 1) {
    await page.evaluate(() => globalThis.__droppleDispatcher?.undo?.());
  }

  const afterUndo = await page.evaluate((ids) => {
    const allIds = Array.from(
      new Set(
        Array.from(document.querySelectorAll('[data-node-id]'))
          .map((el) => el.getAttribute('data-node-id'))
          .filter(Boolean)
      )
    );
    const byId = {};
    ids.forEach((id) => {
      const el = document.querySelector(`[data-node-id="${id}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      byId[id] = {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
      };
    });
    return { allIds, byId };
  }, [sourceAId, sourceBId]);

  expect(afterUndo.allIds.length === 2 || afterUndo.allIds.length === 4).toBe(true);

  for (let i = 0; i < undoSteps; i += 1) {
    await page.evaluate(() => globalThis.__droppleDispatcher?.redo?.());
  }
  await waitForNodeCount(page, 4);

  const afterRedo = await page.evaluate((sourceIds) => {
    const sourceSet = new Set(sourceIds);
    const allIds = Array.from(
      new Set(
        Array.from(document.querySelectorAll('[data-node-id]'))
          .map((el) => el.getAttribute('data-node-id'))
          .filter(Boolean)
      )
    );
    const duplicateIds = allIds.filter((id) => !sourceSet.has(id));
    const byId = {};
    allIds.forEach((id) => {
      const el = document.querySelector(`[data-node-id="${id}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      byId[id] = {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
      };
    });
    return {
      allIds: [...allIds].sort(),
      duplicateIds: [...duplicateIds].sort(),
      byId,
    };
  }, [sourceAId, sourceBId]);
  expect(afterRedo.duplicateIds).toHaveLength(2);
  expect(afterRedo.allIds).toEqual(duplicatedSnapshot.allIds);
  for (const id of afterRedo.allIds) {
    expect(afterRedo.byId[id]?.x).toBe(duplicatedSnapshot.byId[id]?.x);
    expect(afterRedo.byId[id]?.y).toBe(duplicatedSnapshot.byId[id]?.y);
  }

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new alt-drag releasing alt before threshold still duplicates from drag-start intent', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const runFlow = async () => {
    await gotoNewWorkspace(page);
    await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });

    const nodes = visibleNodeLocators(page);
    await expect(nodes).toHaveCount(1);
    const source = nodes.first();
    await expect(source).toBeVisible();

    await activateTool(page, 'select');
    await source.click({ force: true });
    await expect(page.getByTestId('selection-outline')).toHaveCount(1);

    const sourceId = await source.getAttribute('data-node-id');
    expect(sourceId).toBeTruthy();

    const before = await source.boundingBox();
    expect(before).not.toBeNull();

    await dragNodeWithAltReleaseBeforeThreshold(page, source, { x: 90, y: 55 });
    await waitForNodeCount(page, 2);

    const duplicateId = await page.evaluate((id) => {
      const ids = Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter(Boolean)
        )
      );
      return ids.find((nodeId) => nodeId !== id) ?? null;
    }, sourceId);
    expect(duplicateId).toBeTruthy();

    const sourceAfter = visibleNodeById(page, sourceId);
    await expect(sourceAfter).toBeVisible();
    const sourceAfterBox = await sourceAfter.boundingBox();
    expect(sourceAfterBox).not.toBeNull();
    expect(sourceAfterBox.x).toBeCloseTo(before.x, 0);
    expect(sourceAfterBox.y).toBeCloseTo(before.y, 0);

    const duplicate = visibleNodeById(page, duplicateId);
    await expect(duplicate).toBeVisible();
    const duplicateBox = await duplicate.boundingBox();
    expect(duplicateBox).not.toBeNull();
    expect(Math.abs(duplicateBox.x - sourceAfterBox.x)).toBeGreaterThanOrEqual(30);
    expect(Math.abs(duplicateBox.y - sourceAfterBox.y)).toBeGreaterThanOrEqual(20);

    await expect(page.getByTestId('selection-outline')).toHaveCount(1);
    await expect(page.locator('[data-selection-primary="true"]')).toHaveCount(1);
    await expect(page.locator('[data-selection-primary="true"]')).toHaveAttribute(
      'data-selection-node-id',
      duplicateId
    );

    return JSON.stringify({
      source: {
        x: Math.round(sourceAfterBox.x),
        y: Math.round(sourceAfterBox.y),
      },
      duplicate: {
        x: Math.round(duplicateBox.x),
        y: Math.round(duplicateBox.y),
      },
      count: await nodes.count(),
    });
  };

  const hashA = await runFlow();
  await page.reload({ waitUntil: 'networkidle' });
  const hashB = await runFlow();
  expect(hashB).toBe(hashA);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new shift-alt drag on multi-selection stays non-duplicating and mutation-free', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const runFlow = async () => {
    await gotoNewWorkspace(page);
    await createFrame(page, { x: 140, y: 180 }, { x: 280, y: 300 });
    await createFrame(page, { x: 320, y: 220 }, { x: 460, y: 340 });

    const nodes = visibleNodeLocators(page);
    await waitForNodeCount(page, 2);

    const sourceA = nodes.nth(0);
    const sourceB = nodes.nth(1);
    await activateTool(page, 'select');
    await sourceA.click({ force: true });
    await page.keyboard.down('Shift');
    await sourceB.click({ force: true });
    await page.keyboard.up('Shift');
    await expect(page.getByTestId('selection-outline')).toHaveCount(2);

    const sourceAId = await sourceA.getAttribute('data-node-id');
    const sourceBId = await sourceB.getAttribute('data-node-id');
    expect(sourceAId).toBeTruthy();
    expect(sourceBId).toBeTruthy();

    const beforeState = await page.evaluate((ids) => {
      const out = {};
      ids.forEach((id) => {
        const el = document.querySelector(`[data-node-id="${id}"]`);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        out[id] = {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
        };
      });
      return out;
    }, [sourceAId, sourceBId]);

    await dragNode(page, sourceB, { x: 90, y: 55 }, { holdAlt: true, holdShiftDuringMove: true });
    await waitForNodeCount(page, 2);
    await expect(page.getByTestId('selection-outline')).toHaveCount(2);

    const afterMove = await page.evaluate((sourceIds) => {
      const sourceSet = new Set(sourceIds);
      const allIds = Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter(Boolean)
        )
      );
      const duplicateIds = allIds.filter((id) => !sourceSet.has(id));
      const byId = {};
      allIds.forEach((id) => {
        const el = document.querySelector(`[data-node-id="${id}"]`);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        byId[id] = {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
        };
      });
      return {
        allIds: [...allIds].sort(),
        duplicateIds,
        byId,
      };
    }, [sourceAId, sourceBId]);

    expect(afterMove.duplicateIds).toHaveLength(0);
    expect(afterMove.allIds).toEqual([sourceAId, sourceBId].sort());
    expect(afterMove.byId[sourceAId].x).toBe(beforeState[sourceAId].x);
    expect(afterMove.byId[sourceAId].y).toBe(beforeState[sourceAId].y);
    expect(afterMove.byId[sourceBId].x).toBe(beforeState[sourceBId].x);
    expect(afterMove.byId[sourceBId].y).toBe(beforeState[sourceBId].y);

    const normalized = [afterMove.byId[sourceAId], afterMove.byId[sourceBId]]
      .map((entry) => `${entry.x}:${entry.y}`)
      .sort();
    return JSON.stringify({
      count: afterMove.allIds.length,
      normalized,
    });
  };

  const hashA = await runFlow();
  await page.reload({ waitUntil: 'networkidle' });
  const hashB = await runFlow();
  expect(hashB).toBe(hashA);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new alt-held shift-release mid-drag duplicates once and exits axis lock deterministically', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const runFlow = async () => {
    await gotoNewWorkspace(page);
    await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });

    const nodes = visibleNodeLocators(page);
    await expect(nodes).toHaveCount(1);
    const source = nodes.first();

    await activateTool(page, 'select');
    await source.click({ force: true });
    await expect(page.getByTestId('selection-outline')).toHaveCount(1);

    const sourceId = await source.getAttribute('data-node-id');
    expect(sourceId).toBeTruthy();

    await dragNodeWithAltHeldShiftReleasedMidDrag(page, source, { x: 92, y: 54 });

    await waitForNodeCount(page, 2);
    const duplicateId = await page.evaluate((id) => {
      const ids = Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter(Boolean)
        )
      );
      return ids.find((candidate) => candidate !== id) || null;
    }, sourceId);
    expect(duplicateId).toBeTruthy();

    const sourceAfter = visibleNodeById(page, sourceId);
    const duplicate = visibleNodeById(page, duplicateId);
    await expect(sourceAfter).toBeVisible();
    await expect(duplicate).toBeVisible();

    const sourceBox = await sourceAfter.boundingBox();
    const duplicateBox = await duplicate.boundingBox();
    expect(sourceBox).not.toBeNull();
    expect(duplicateBox).not.toBeNull();

    expect(Math.abs(duplicateBox.x - sourceBox.x)).toBeGreaterThanOrEqual(24);
    expect(Math.abs(duplicateBox.y - sourceBox.y)).toBeGreaterThanOrEqual(18);
    await expect(page.getByTestId('selection-outline')).toHaveCount(1);

    return JSON.stringify({
      source: {
        x: Math.round(sourceBox.x),
        y: Math.round(sourceBox.y),
      },
      duplicate: {
        x: Math.round(duplicateBox.x),
        y: Math.round(duplicateBox.y),
      },
      count: await nodes.count(),
    });
  };

  const hashA = await runFlow();
  await page.reload({ waitUntil: 'networkidle' });
  const hashB = await runFlow();
  expect(hashB).toBe(hashA);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new alt-held shift-release duplicate remains undo-redo lawful and replay-stable', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const runFlow = async () => {
    await gotoNewWorkspace(page);
    await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });

    const nodes = visibleNodeLocators(page);
    await waitForNodeCount(page, 1);
    const source = nodes.first();
    await activateTool(page, 'select');
    await source.click({ force: true });

    const sourceId = await source.getAttribute('data-node-id');
    expect(sourceId).toBeTruthy();

    const before = await page.evaluate((id) => {
      const el = document.querySelector(`[data-node-id="${id}"]`);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y) };
    }, sourceId);
    expect(before).not.toBeNull();

    await dragNodeWithAltHeldShiftReleasedMidDrag(page, source, { x: 92, y: 54 });
    await waitForNodeCount(page, 2);

    const duplicatedSnapshot = await page.evaluate((id) => {
      const allIds = Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter(Boolean)
        )
      ).sort();
      const duplicateId = allIds.find((candidate) => candidate !== id) ?? null;
      const byId = {};
      allIds.forEach((nodeId) => {
        const el = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        byId[nodeId] = {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
        };
      });
      const primary = document
        .querySelector('[data-selection-primary="true"]')
        ?.getAttribute('data-selection-node-id');
      return {
        allIds,
        duplicateId,
        primary,
        byId,
      };
    }, sourceId);

    expect(duplicatedSnapshot.allIds).toHaveLength(2);
    expect(duplicatedSnapshot.duplicateId).toBeTruthy();
    expect(duplicatedSnapshot.duplicateId).not.toBe(sourceId);
    expect(duplicatedSnapshot.primary).toBe(duplicatedSnapshot.duplicateId);

    let undoSteps = 0;
    let reachedSingle = false;
    for (; undoSteps < 16; undoSteps += 1) {
      await page.evaluate(() => globalThis.__droppleDispatcher?.undo?.());
      const count = await nodes.count();
      if (count === 1) {
        reachedSingle = true;
        break;
      }
    }
    expect(reachedSingle).toBe(true);
    await waitForNodeCount(page, 1);

    const afterUndo = await page.evaluate((id) => {
      const allIds = Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter(Boolean)
        )
      ).sort();
      const el = document.querySelector(`[data-node-id="${id}"]`);
      if (!el) return { allIds, source: null };
      const rect = el.getBoundingClientRect();
      const primary = document
        .querySelector('[data-selection-primary="true"]')
        ?.getAttribute('data-selection-node-id');
      return {
        allIds,
        primary,
        source: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
        },
      };
    }, sourceId);

    expect(afterUndo.allIds).toEqual([sourceId]);
    if (afterUndo.primary != null) {
      expect(afterUndo.primary).toBe(sourceId);
    }
    expect(afterUndo.source?.x).toBe(before.x);
    expect(afterUndo.source?.y).toBe(before.y);

    for (let i = 0; i <= undoSteps; i += 1) {
      await page.evaluate(() => globalThis.__droppleDispatcher?.redo?.());
    }
    await waitForNodeCount(page, 2);

    const afterRedo = await page.evaluate(() => {
      const allIds = Array.from(
        new Set(
          Array.from(document.querySelectorAll('[data-node-id]'))
            .map((el) => el.getAttribute('data-node-id'))
            .filter(Boolean)
        )
      ).sort();
      const byId = {};
      allIds.forEach((nodeId) => {
        const el = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        byId[nodeId] = {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
        };
      });
      const primary = document
        .querySelector('[data-selection-primary="true"]')
        ?.getAttribute('data-selection-node-id');
      return { allIds, byId, primary };
    });

    expect(afterRedo.allIds).toEqual(duplicatedSnapshot.allIds);
    if (afterRedo.primary != null && duplicatedSnapshot.primary != null) {
      expect(afterRedo.primary).toBe(duplicatedSnapshot.primary);
    }
    for (const nodeId of duplicatedSnapshot.allIds) {
      expect(afterRedo.byId[nodeId]?.x).toBe(duplicatedSnapshot.byId[nodeId]?.x);
      expect(afterRedo.byId[nodeId]?.y).toBe(duplicatedSnapshot.byId[nodeId]?.y);
    }

    const canonicalPoints = Object.values(afterRedo.byId)
      .map((entry) => `${entry.x}:${entry.y}`)
      .sort();
    return JSON.stringify({
      count: afterRedo.allIds.length,
      points: canonicalPoints,
    });
  };

  const hashA = await runFlow();
  await page.reload({ waitUntil: 'networkidle' });
  const hashB = await runFlow();
  expect(hashB).toBe(hashA);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new pointercancel during alt+shift pending drag fails closed and next drag stays clean', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const runFlow = async () => {
    await gotoNewWorkspace(page);
    await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });

    const nodes = visibleNodeLocators(page);
    await waitForNodeCount(page, 1);
    const source = nodes.first();
    await activateTool(page, 'select');
    await source.click({ force: true });
    await expect(page.getByTestId('selection-outline')).toHaveCount(1);

    const sourceId = await source.getAttribute('data-node-id');
    expect(sourceId).toBeTruthy();
    const before = await source.boundingBox();
    expect(before).not.toBeNull();

    await page.keyboard.down('Alt');
    await page.keyboard.down('Shift');
    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
    await page.mouse.down();
    await page.mouse.move(before.x + before.width / 2 + 2, before.y + before.height / 2 + 1, {
      steps: 2,
    });
    await cancelActivePointerSession(page, {
      pointerId: 1,
      clientX: before.x + before.width / 2 + 2,
      clientY: before.y + before.height / 2 + 1,
    });
    await page.keyboard.up('Shift');
    await page.keyboard.up('Alt');

    await waitForNodeCount(page, 1);
    const afterCancel = visibleNodeById(page, sourceId);
    await expect(afterCancel).toBeVisible();

    // Ensure subsequent drag starts from a clean interaction state.
    await dragNode(page, afterCancel, { x: 70, y: 45 });
    const moved = await afterCancel.boundingBox();
    expect(Math.abs(moved.x - before.x)).toBeGreaterThanOrEqual(24);
    expect(Math.abs(moved.y - before.y)).toBeGreaterThanOrEqual(16);

    return JSON.stringify({
      count: await nodes.count(),
      x: Math.round(moved.x),
      y: Math.round(moved.y),
      w: Math.round(moved.width),
      h: Math.round(moved.height),
    });
  };

  const hashA = await runFlow();
  await page.reload({ waitUntil: 'networkidle' });
  const hashB = await runFlow();
  expect(hashB).toBe(hashA);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new shift-drag releasing shift mid-drag clears axis lock and remains deterministic', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const runFlow = async () => {
    await gotoNewWorkspace(page);
    await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });

    const nodes = visibleNodeLocators(page);
    await expect(nodes).toHaveCount(1);
    const source = nodes.first();

    await activateTool(page, 'select');
    await source.click({ force: true });
    await expect(page.getByTestId('selection-outline')).toHaveCount(1);

    const sourceId = await source.getAttribute('data-node-id');
    expect(sourceId).toBeTruthy();
    const before = await source.boundingBox();
    expect(before).not.toBeNull();

    await dragNodeWithShiftReleaseMidDrag(page, source, { x: 96, y: 56 });

    const after = visibleNodeById(page, sourceId);
    await expect(after).toBeVisible();
    const afterBox = await after.boundingBox();
    expect(afterBox).not.toBeNull();

    const dx = Math.abs(afterBox.x - before.x);
    const dy = Math.abs(afterBox.y - before.y);
    expect(dx).toBeGreaterThanOrEqual(32);
    expect(dy).toBeGreaterThanOrEqual(20);

    await expect(page.getByTestId('selection-outline')).toHaveCount(1);
    await expect(page.locator('[data-selection-primary="true"]')).toHaveAttribute(
      'data-selection-node-id',
      sourceId
    );

    return JSON.stringify({
      x: Math.round(afterBox.x),
      y: Math.round(afterBox.y),
      width: Math.round(afterBox.width),
      height: Math.round(afterBox.height),
    });
  };

  const hashA = await runFlow();
  await page.reload({ waitUntil: 'networkidle' });
  const hashB = await runFlow();
  expect(hashB).toBe(hashA);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudge commits canonical layout and remains replay-stable with no projection residue', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  const runFlow = async () => {
    await gotoNewWorkspace(page);
    await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
    const node = visibleNodeLocator(page);
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
  const node = visibleNodeLocator(page);
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
  const node = visibleNodeLocator(page);
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
  const node = visibleNodeLocator(page);
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
  const node = visibleNodeLocator(page);
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
  await clearSelectionFromCanvas(page);
  const noSelectionStart = await readLayout();
  expect(noSelectionStart).toBeTruthy();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  const noSelectionEnd = await readLayout();
  expect(noSelectionEnd).toEqual(noSelectionStart);

  // With selection established.
  await ensureNodeSelected(page, node);
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
  const node = visibleNodeLocator(page);
  await expect(node).toBeVisible();

  await ensureNodeSelected(page, node);
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

  const nodes = visibleNodeLocators(page);
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

test('workspace new keyboard shift-alt nudge on multi-selection is deterministic, non-duplicating, and preserves primary anchor', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const runFlow = async () => {
    await gotoNewWorkspace(page);
    await createFrame(page, { x: 140, y: 180 }, { x: 260, y: 300 });
    await createFrame(page, { x: 340, y: 180 }, { x: 460, y: 300 });
    await createFrame(page, { x: 540, y: 180 }, { x: 660, y: 300 });

    const nodes = visibleNodeLocators(page);
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

    const readLayouts = async () =>
      page.evaluate((ids) => {
        const state = globalThis.__droppleDispatcher?.getState?.();
        const layoutNodes = state?.document?.layout?.nodes ?? {};
        const result = {};
        ids.forEach((id) => {
          const layout = layoutNodes[id];
          if (!layout) return;
          result[id] = { x: layout.x ?? null, y: layout.y ?? null };
        });
        return result;
      }, selectedNodeIds);

    const before = await readLayouts();
    await page.keyboard.press('Shift+Alt+ArrowRight');
    await page.keyboard.press('Shift+Alt+ArrowDown');
    const after = await readLayouts();

    selectedNodeIds.forEach((id) => {
      expect(after[id].x - before[id].x).toBe(10);
      expect(after[id].y - before[id].y).toBe(10);
    });

    await expect(nodes).toHaveCount(3);
    await expect(page.getByTestId('selection-outline')).toHaveCount(3);
    await expect(selectionPrimary).toHaveCount(1);
    await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', primaryBefore);

    const normalized = selectedNodeIds
      .map((id) => `${after[id].x}:${after[id].y}`)
      .sort();
    return JSON.stringify({
      count: await nodes.count(),
      normalized,
    });
  };

  const hashA = await runFlow();
  await page.reload({ waitUntil: 'networkidle' });
  const hashB = await runFlow();
  expect(hashB).toBe(hashA);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new keyboard nudges remain lawful under undo and redo history', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = visibleNodeLocator(page);
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
  let node = visibleNodeLocator(page);
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
  await expect(visibleCanvasHost(page)).toBeVisible();
  await gotoNewWorkspace(page);
  await expect(visibleCanvasHost(page)).toBeVisible();

  await createFrame(page, { x: 260, y: 220 }, { x: 400, y: 340 });
  node = visibleNodeLocator(page);
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

test('workspace drag session is cleared across route transition and resumes cleanly on return', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = visibleNodeLocator(page);
  await expect(node).toBeVisible();
  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);

  const sourceId = await node.getAttribute('data-node-id');
  expect(sourceId).toBeTruthy();
  const before = await node.boundingBox();
  expect(before).not.toBeNull();

  // Start an in-flight drag (pointer down + movement over threshold), then route away.
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await page.mouse.move(before.x + before.width / 2 + 26, before.y + before.height / 2 + 14, {
    steps: 5,
  });

  await page.goto('/workspace/graphic', { waitUntil: 'networkidle' });
  await expect(visibleCanvasHost(page)).toBeVisible();

  const dragActiveAfterRoute = await page.evaluate(() => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    return Boolean(state?.interaction?.drag?.active);
  });
  expect(dragActiveAfterRoute).toBe(false);

  // Defensive pointer release in case browser kept button state.
  await page.mouse.up().catch(() => {});

  await gotoNewWorkspace(page);
  await expect(visibleCanvasHost(page)).toBeVisible();

  const dragActiveOnReturn = await page.evaluate(() => {
    const state = globalThis.__droppleDispatcher?.getState?.();
    return Boolean(state?.interaction?.drag?.active);
  });
  expect(dragActiveOnReturn).toBe(false);
  const overlayDebug = await page.evaluate(() => document.documentElement.dataset.droppleOverlayDebug || null);
  expect(overlayDebug === null || overlayDebug === 'idle').toBe(true);

  // Fresh drag on return must behave normally and not leak duplicate/ghost mutations.
  await createFrame(page, { x: 260, y: 220 }, { x: 400, y: 340 });
  const returnNode = visibleNodeLocator(page);
  await expect(returnNode).toBeVisible();
  await activateTool(page, 'select');
  await returnNode.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);

  const returnId = await returnNode.getAttribute('data-node-id');
  expect(returnId).toBeTruthy();
  const returnBefore = await returnNode.boundingBox();
  expect(returnBefore).not.toBeNull();
  await dragNode(page, returnNode, { x: 74, y: 46 });
  await waitForNodeCount(page, 1);

  const moved = await visibleNodeById(page, returnId).boundingBox();
  expect(Math.abs(moved.x - returnBefore.x)).toBeGreaterThanOrEqual(24);
  expect(Math.abs(moved.y - returnBefore.y)).toBeGreaterThanOrEqual(16);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace canvas host contract keeps exactly one visible host across workspace route transitions', async ({ page }) => {
  await gotoNewWorkspace(page);
  await expectSingleVisibleCanvasHost(page);

  await page.goto('/workspace/graphic', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();
  await expectSingleVisibleCanvasHost(page);

  await page.goto('/workspace/media', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-tool-id="select"]').first()).toBeVisible();
  await expectSingleVisibleCanvasHost(page);

  await gotoNewWorkspace(page);
  await expectSingleVisibleCanvasHost(page);
});

test('project world continuity stays stable across browser history after perspective handoff and camera reset', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const response = await page.goto('/workspace/create?blueprint=bp.logistics.v1&bootstrap=1&z=0.300&u=group%3Aoperate&uq=operate', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'project world continuity route should respond successfully').toBeTruthy();
  await page.goto('/workspace/build?entry=application&u=group%3Aoperate&uq=operate', {
    waitUntil: 'networkidle',
  });
  await expect(page).toHaveURL(/\/workspace\/build\?/);
  await expect(page).toHaveURL(/[\?&]entry=application/);
  await expect(page).toHaveURL(/[\?&]u=group%3Aoperate/);

  await page.getByRole('button', { name: 'Reset' }).click();

  await page.goBack({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/workspace\/create\?/);
  await expect(page).toHaveURL(/[\?&]u=group%3Aoperate/);
  await expectSingleVisibleCanvasHost(page);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('artifact-driven workflow handoff preserves continuity across perspective history', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const response = await page.goto('/workspace/build?blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'artifact-driven handoff route should respond successfully').toBeTruthy();
  await page.getByTestId('build-workflow-operate-handoff').click();
  await expect(page).toHaveURL(/\/workspace\/operate\?/);
  await expect(page).toHaveURL(/[\?&]u=system%3Amodel/);
  await expect(page.getByTestId('project-shell-transition-context')).toContainText('moving from System Model');
  await expect(page.getByTestId('project-shell-project-intent')).toContainText('Move from build planning into live operating context.');

  await page.goBack({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/workspace\/build\?/);
  await expect(page.locator('body')).toContainText('Build > Application');
  await expect(page.getByTestId('project-world-anchor-focus')).toContainText('Project Hub');

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('publish workflow artifact continuity stays stable across same-room history', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);

  const response = await page.goto('/workspace/publish?entry=governance&blueprint=bp.logistics.v1&bootstrap=1', {
    waitUntil: 'networkidle',
  });

  expect(response?.ok(), 'publish artifact continuity route should respond successfully').toBeTruthy();
  await page.getByTestId('publish-workflow-suggested-next').click();
  await expect(page).toHaveURL(/\/workspace\/publish\?/);
  await expect(page).toHaveURL(/[\?&]entry=conversion/);
  await expect(page).toHaveURL(/[\?&]u=document%3Aprimary/);
  await expect(page.getByTestId('project-shell-transition-context')).toContainText('opened from Untitled');
  await expect(page.getByTestId('project-shell-project-intent')).toContainText('Continue publishing conversion through Untitled.');

  await page.goBack({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/workspace\/publish\?/);
  await expect(page).toHaveURL(/[\?&]entry=governance/);
  await expect(page.getByTestId('publish-world-panel')).toContainText('Publish World');
  await expect(page.getByTestId('project-world-anchor-focus')).toContainText('Project Hub');

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace pointercancel does not leave stuck alt/shift state for keyboard nudge deltas', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const nodes = visibleNodeLocators(page);
  await waitForNodeCount(page, 1);
  const node = nodes.first();
  await expect(node).toBeVisible();
  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);

  const nodeId = await node.getAttribute('data-node-id');
  expect(nodeId).toBeTruthy();

  const readLayoutX = async () =>
    page.evaluate((id) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      return state?.document?.layout?.nodes?.[id]?.x ?? null;
    }, nodeId);

  const beforeBase = await readLayoutX();
  expect(typeof beforeBase).toBe('number');
  await page.keyboard.press('ArrowRight');
  const afterBase = await readLayoutX();
  expect(typeof afterBase).toBe('number');
  const baseStep = afterBase - beforeBase;
  expect(baseStep).toBeGreaterThan(0);

  const box = await node.boundingBox();
  expect(box).not.toBeNull();

  // Enter an alt+shift pending drag, then cancel it.
  await page.keyboard.down('Alt');
  await page.keyboard.down('Shift');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 2, box.y + box.height / 2 + 1, { steps: 2 });
  await cancelActivePointerSession(page, {
    pointerId: 1,
    clientX: box.x + box.width / 2 + 2,
    clientY: box.y + box.height / 2 + 1,
  });
  await page.keyboard.up('Shift');
  await page.keyboard.up('Alt');
  await waitForNodeCount(page, 1);

  const beforePostCancelNudge = await readLayoutX();
  expect(typeof beforePostCancelNudge).toBe('number');
  await page.keyboard.press('ArrowRight');
  const afterPostCancelNudge = await readLayoutX();
  expect(typeof afterPostCancelNudge).toBe('number');
  const postCancelStep = afterPostCancelNudge - beforePostCancelNudge;

  expect(postCancelStep).toBe(baseStep);
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveCount(1);
  await expect(page.locator('[data-selection-primary="true"]')).toHaveAttribute(
    'data-selection-node-id',
    nodeId
  );

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});

test('workspace new resize remains modifier-neutral and deterministic across base/shift/alt gestures', async ({ page }) => {
  const runtimeErrors = attachRuntimeErrorCollectors(page);
  await gotoNewWorkspace(page);

  await createFrame(page, { x: 220, y: 180 }, { x: 360, y: 300 });
  const node = visibleNodeLocator(page);
  await expect(node).toBeVisible();

  await activateTool(page, 'select');
  await node.click({ force: true });
  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  const selectedNodeId = await node.getAttribute('data-node-id');
  expect(selectedNodeId).toBeTruthy();

  const selectionPrimary = page.locator('[data-selection-primary="true"]');
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', selectedNodeId);

  const resizeHandle = page.getByTestId('resize-handle').first();
  await expect(resizeHandle).toBeVisible();

  const readLayoutSize = async () =>
    page.evaluate((id) => {
      const state = globalThis.__droppleDispatcher?.getState?.();
      const layout = state?.document?.layout?.nodes?.[id] ?? null;
      if (!layout) return null;
      return {
        width: layout.width ?? null,
        height: layout.height ?? null,
      };
    }, selectedNodeId);

  const start = await readLayoutSize();
  expect(start).toBeTruthy();
  expect(Number.isFinite(start.width)).toBe(true);
  expect(Number.isFinite(start.height)).toBe(true);
  expect(start.width).toBeGreaterThan(0);
  expect(start.height).toBeGreaterThan(0);

  await dragResizeHandle(page, resizeHandle, { x: 24, y: 16 });
  const afterBase = await readLayoutSize();
  expect(afterBase).toBeTruthy();
  const baseDw = afterBase.width - start.width;
  const baseDh = afterBase.height - start.height;
  expect(baseDw).toBeGreaterThan(0);
  expect(baseDh).toBeGreaterThan(0);

  await page.keyboard.down('Shift');
  await dragResizeHandle(page, resizeHandle, { x: 24, y: 16 });
  await page.keyboard.up('Shift');
  const afterShift = await readLayoutSize();
  expect(afterShift).toBeTruthy();
  const shiftDw = afterShift.width - afterBase.width;
  const shiftDh = afterShift.height - afterBase.height;
  expect(shiftDw).toBe(baseDw);
  expect(shiftDh).toBe(baseDh);

  await page.keyboard.down('Alt');
  await dragResizeHandle(page, resizeHandle, { x: 24, y: 16 });
  await page.keyboard.up('Alt');
  const afterAlt = await readLayoutSize();
  expect(afterAlt).toBeTruthy();
  const altDw = afterAlt.width - afterShift.width;
  const altDh = afterAlt.height - afterShift.height;
  expect(altDw).toBe(baseDw);
  expect(altDh).toBe(baseDh);

  expect(Number.isFinite(afterAlt.width)).toBe(true);
  expect(Number.isFinite(afterAlt.height)).toBe(true);
  expect(afterAlt.width).toBeGreaterThan(0);
  expect(afterAlt.height).toBeGreaterThan(0);

  await expect(page.getByTestId('selection-outline')).toHaveCount(1);
  await expect(selectionPrimary).toHaveCount(1);
  await expect(selectionPrimary).toHaveAttribute('data-selection-node-id', selectedNodeId);

  expect(runtimeErrors.pageErrors).toEqual([]);
  expect(runtimeErrors.consoleErrors).toEqual([]);
});
