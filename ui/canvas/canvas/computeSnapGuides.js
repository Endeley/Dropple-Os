import { SNAP_THRESHOLD } from './snapConfig';

export function computeSnapGuides({ movingNode, nodes, viewport }) {
  if (!movingNode) return [];

  const guides = [];

  const mx = movingNode.x;
  const my = movingNode.y;
  const mw = movingNode.width;
  const mh = movingNode.height;

  const m = {
    left: mx,
    right: mx + mw,
    top: my,
    bottom: my + mh,
    cx: mx + mw / 2,
    cy: my + mh / 2,
  };

  for (const node of Object.values(nodes)) {
    if (node.id === movingNode.id) continue;

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

    check(m.left, s.left, 'v', s.left);
    check(m.left, s.right, 'v', s.right);
    check(m.right, s.left, 'v', s.left);
    check(m.right, s.right, 'v', s.right);
    check(m.cx, s.cx, 'v', s.cx);

    check(m.top, s.top, 'h', s.top);
    check(m.top, s.bottom, 'h', s.bottom);
    check(m.bottom, s.top, 'h', s.top);
    check(m.bottom, s.bottom, 'h', s.bottom);
    check(m.cy, s.cy, 'h', s.cy);
  }

  function check(a, b, axis, position) {
    const delta = Math.abs((a - b) * viewport.zoom);
    if (delta <= SNAP_THRESHOLD) {
      guides.push({ axis, position });
    }
  }

  return guides;
}
