import { SNAP_THRESHOLD } from './snapConfig';

const GUIDE_PRIORITY = {
    center: 3,
    spacing: 2,
    edge: 1,
};

const ALLOWED_KINDS_BY_TIER = {
    far: new Set([]),
    overview: new Set(['center']),
    normal: new Set(['center', 'spacing']),
    detail: new Set(['center', 'spacing', 'edge']),
    micro: new Set(['center', 'spacing', 'edge']),
};

/**
 * Read-only snap guide detection (visual only).
 * World-space only. No snapping, no mutation.
 */
export function computeSnapGuides({ movingNode, nodes, zoomTier }) {
    if (!movingNode) return [];

    const guides = [];
    const SPACING_EPSILON = 6;
    const parentId = movingNode.parentId ?? null;
    const parentNode = parentId ? nodes[parentId] : null;
    const isFrameScoped = parentNode?.type === 'frame';
    const candidateNodes = isFrameScoped
        ? Object.values(nodes).filter(
              (node) => node.parentId === parentId && node.id !== movingNode.id
          )
        : Object.values(nodes).filter((node) => node.id !== movingNode.id);

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

    for (const node of candidateNodes) {

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
        checkX(m.left, s.left, 'edge', t, t + h, node.id);
        checkX(m.left, s.right, 'edge', t, t + h, node.id);
        checkX(m.right, s.left, 'edge', t, t + h, node.id);
        checkX(m.right, s.right, 'edge', t, t + h, node.id);
        checkX(m.cx, s.cx, 'center', t, t + h, node.id);

        // Y-axis alignment (horizontal guides)
        checkY(m.top, s.top, 'edge', l, l + w, node.id);
        checkY(m.top, s.bottom, 'edge', l, l + w, node.id);
        checkY(m.bottom, s.top, 'edge', l, l + w, node.id);
        checkY(m.bottom, s.bottom, 'edge', l, l + w, node.id);
        checkY(m.cy, s.cy, 'center', l, l + w, node.id);
    }

    const siblingPool = candidateNodes;
    const sameParent =
        movingNode.parentId != null
            ? siblingPool.filter((node) => node.parentId === movingNode.parentId)
            : [];
    const spacingCandidates = sameParent.length ? sameParent : siblingPool;

    guides.push(
        ...computeSpacingGuides({
            moving: movingNode,
            siblings: spacingCandidates,
            axis: 'x',
            epsilon: SPACING_EPSILON,
        })
    );
    guides.push(
        ...computeSpacingGuides({
            moving: movingNode,
            siblings: spacingCandidates,
            axis: 'y',
            epsilon: SPACING_EPSILON,
        })
    );

    function checkX(a, b, kind, from, to, sourceNodeId) {
        if (Math.abs(a - b) <= SNAP_THRESHOLD) {
            const distance = Math.abs(a - b);
            pushUnique({
                axis: 'x',
                value: b,
                from,
                to,
                kind,
                sourceNodeId: sourceNodeId ?? null,
                _priority: GUIDE_PRIORITY[kind] || 0,
                _distance: distance,
            });
        }
    }

    function checkY(a, b, kind, from, to, sourceNodeId) {
        if (Math.abs(a - b) <= SNAP_THRESHOLD) {
            const distance = Math.abs(a - b);
            pushUnique({
                axis: 'y',
                value: b,
                from,
                to,
                kind,
                sourceNodeId: sourceNodeId ?? null,
                _priority: GUIDE_PRIORITY[kind] || 0,
                _distance: distance,
            });
        }
    }

    function pushUnique(guide) {
        const exists = guides.some((g) => g.axis === guide.axis && g.value === guide.value && g.kind === guide.kind);
        if (!exists) guides.push(guide);
    }

    const prioritized = applyGuidePriority(guides);
    const filtered = applyZoomTierSuppression(prioritized, zoomTier);
    return filtered.map(toEngineGuide).filter(Boolean);
}

function computeSpacingGuides({ moving, siblings, axis, epsilon }) {
    if (!moving || !siblings || siblings.length < 2) return [];

    const guides = [];
    const getMin = (n) => (axis === 'x' ? n.layout.x : n.layout.y);
    const getMax = (n) =>
        axis === 'x'
            ? n.layout.x + n.layout.width
            : n.layout.y + n.layout.height;

    const mMin = axis === 'x' ? moving.x : moving.y;
    const mMax =
        axis === 'x'
            ? moving.x + moving.width
            : moving.y + moving.height;

    const ordered = siblings
        .filter((n) => n?.layout)
        .sort((a, b) => getMin(a) - getMin(b));

    let prev = null;
    let next = null;

    for (const n of ordered) {
        if (getMax(n) <= mMin) prev = n;
        if (!next && getMin(n) >= mMax) next = n;
    }

    if (!prev || !next) return [];

    const gapPrev = mMin - getMax(prev);
    const gapNext = getMin(next) - mMax;

    if (gapPrev < 0 || gapNext < 0) return [];

    if (Math.abs(gapPrev - gapNext) <= epsilon) {
        const gapCenter = (getMax(prev) + getMin(next)) / 2;
        const from =
            axis === 'x'
                ? Math.min(prev.layout.y, moving.y, next.layout.y)
                : Math.min(prev.layout.x, moving.x, next.layout.x);
        const to =
            axis === 'x'
                ? Math.max(
                      prev.layout.y + prev.layout.height,
                      moving.y + moving.height,
                      next.layout.y + next.layout.height
                  )
                : Math.max(
                      prev.layout.x + prev.layout.width,
                      moving.x + moving.width,
                      next.layout.x + next.layout.width
                  );

        guides.push({
            axis,
            kind: 'spacing',
            value: gapCenter,
            from,
            to,
            gap: Math.round((gapPrev + gapNext) / 2),
            sourceNodeId: null,
            _priority: GUIDE_PRIORITY.spacing,
            _distance: Math.abs(gapPrev - gapNext),
        });
    }

    return guides;
}

function applyGuidePriority(guides) {
    const byAxis = { x: [], y: [] };
    for (const guide of guides) {
        if (guide?.axis === 'x' || guide?.axis === 'y') {
            byAxis[guide.axis].push(guide);
        }
    }

    const result = [];
    for (const axis of ['x', 'y']) {
        if (!byAxis[axis].length) continue;
        const sorted = byAxis[axis].sort((a, b) => {
            if (b._priority !== a._priority) {
                return b._priority - a._priority;
            }
            return (a._distance ?? 0) - (b._distance ?? 0);
        });
        result.push(stripInternal(sorted[0]));
    }
    return result;
}

function stripInternal(guide) {
    const { _priority, _distance, ...clean } = guide;
    return clean;
}

function applyZoomTierSuppression(guides, zoomTier) {
    const allowed = ALLOWED_KINDS_BY_TIER[zoomTier];
    if (!allowed || allowed.size === 0) return [];
    return guides.filter((guide) => allowed.has(guide.kind));
}

function toEngineGuide(guide) {
    if (guide?.axis === 'x') {
        return {
            type: 'vertical',
            x: guide.value,
            sourceNodeId: guide.sourceNodeId ?? null,
        };
    }
    if (guide?.axis === 'y') {
        return {
            type: 'horizontal',
            y: guide.value,
            sourceNodeId: guide.sourceNodeId ?? null,
        };
    }
    return null;
}
