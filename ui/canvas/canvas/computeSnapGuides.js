import { SNAP_THRESHOLD } from './snapConfig';

/**
 * Read-only snap guide detection (visual only).
 * World-space only. No snapping, no mutation.
 */
export function computeSnapGuides({ movingNode, nodes }) {
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

        // X-axis alignment (vertical guides)
        checkX(m.left, s.left, 'edge', t, t + h);
        checkX(m.left, s.right, 'edge', t, t + h);
        checkX(m.right, s.left, 'edge', t, t + h);
        checkX(m.right, s.right, 'edge', t, t + h);
        checkX(m.cx, s.cx, 'center', t, t + h);

        // Y-axis alignment (horizontal guides)
        checkY(m.top, s.top, 'edge', l, l + w);
        checkY(m.top, s.bottom, 'edge', l, l + w);
        checkY(m.bottom, s.top, 'edge', l, l + w);
        checkY(m.bottom, s.bottom, 'edge', l, l + w);
        checkY(m.cy, s.cy, 'center', l, l + w);
    }

    function checkX(a, b, kind, from, to) {
        if (Math.abs(a - b) <= SNAP_THRESHOLD) {
            pushUnique({
                axis: 'x',
                value: b,
                from,
                to,
                kind,
            });
        }
    }

    function checkY(a, b, kind, from, to) {
        if (Math.abs(a - b) <= SNAP_THRESHOLD) {
            pushUnique({
                axis: 'y',
                value: b,
                from,
                to,
                kind,
            });
        }
    }

    function pushUnique(guide) {
        const exists = guides.some((g) => g.axis === guide.axis && g.value === guide.value && g.kind === guide.kind);
        if (!exists) guides.push(guide);
    }

    return guides;
}
