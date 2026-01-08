import { SNAP_THRESHOLD } from './snapConfig';

export function resolveSnap({ movingNode, nodes, viewport }) {
  let snapX = movingNode.x;
  let snapY = movingNode.y;

  const m = {
    left: movingNode.x,
    right: movingNode.x + movingNode.width,
    cx: movingNode.x + movingNode.width / 2,
    top: movingNode.y,
    bottom: movingNode.y + movingNode.height,
    cy: movingNode.y + movingNode.height / 2,
  };

  let bestDx = null;
  let bestDy = null;

  for (const node of Object.values(nodes)) {
    if (node.id === movingNode.id) continue;

    const l = node.layout.x;
    const t = node.layout.y;
    const w = node.layout.width;
    const h = node.layout.height;

    const s = {
      left: l,
      right: l + w,
      cx: l + w / 2,
      top: t,
      bottom: t + h,
      cy: t + h / 2,
    };

    [
      [m.left, s.left],
      [m.left, s.right],
      [m.right, s.left],
      [m.right, s.right],
      [m.cx, s.cx],
    ].forEach(([a, b]) => {
      const delta = (a - b) * viewport.zoom;
      if (Math.abs(delta) <= SNAP_THRESHOLD) {
        const dx = b - a;
        if (bestDx === null || Math.abs(dx) < Math.abs(bestDx)) {
          bestDx = dx;
        }
      }
    });

    [
      [m.top, s.top],
      [m.top, s.bottom],
      [m.bottom, s.top],
      [m.bottom, s.bottom],
      [m.cy, s.cy],
    ].forEach(([a, b]) => {
      const delta = (a - b) * viewport.zoom;
      if (Math.abs(delta) <= SNAP_THRESHOLD) {
        const dy = b - a;
        if (bestDy === null || Math.abs(dy) < Math.abs(bestDy)) {
          bestDy = dy;
        }
      }
    });
  }

  if (bestDx !== null) snapX += bestDx;
  if (bestDy !== null) snapY += bestDy;

  return { x: snapX, y: snapY };
}

export function resolveResizeSnap({ resizingNode, nodes, viewport }) {
  let snapW = resizingNode.width;
  let snapH = resizingNode.height;

  const m = {
    right: resizingNode.x + resizingNode.width,
    bottom: resizingNode.y + resizingNode.height,
    cx: resizingNode.x + resizingNode.width / 2,
    cy: resizingNode.y + resizingNode.height / 2,
  };

  let bestDw = null;
  let bestDh = null;

  for (const node of Object.values(nodes)) {
    if (node.id === resizingNode.id) continue;

    const l = node.layout.x;
    const t = node.layout.y;
    const w = node.layout.width;
    const h = node.layout.height;

    const s = {
      left: l,
      right: l + w,
      top: t,
      bottom: t + h,
      cx: l + w / 2,
      cy: t + h / 2,
    };

    [s.left, s.right, s.cx].forEach((b) => {
      const delta = (m.right - b) * viewport.zoom;
      if (Math.abs(delta) <= SNAP_THRESHOLD) {
        const dw = b - m.right;
        if (bestDw === null || Math.abs(dw) < Math.abs(bestDw)) {
          bestDw = dw;
        }
      }
    });

    [s.top, s.bottom, s.cy].forEach((b) => {
      const delta = (m.bottom - b) * viewport.zoom;
      if (Math.abs(delta) <= SNAP_THRESHOLD) {
        const dh = b - m.bottom;
        if (bestDh === null || Math.abs(dh) < Math.abs(bestDh)) {
          bestDh = dh;
        }
      }
    });
  }

  if (bestDw !== null) snapW += bestDw;
  if (bestDh !== null) snapH += bestDh;

  return {
    width: Math.max(20, snapW),
    height: Math.max(20, snapH),
  };
}
