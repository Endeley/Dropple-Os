export const SNAP_TYPES = {
    EDGE_LEFT: 'edge-left',
    EDGE_RIGHT: 'edge-right',
    EDGE_TOP: 'edge-top',
    EDGE_BOTTOM: 'edge-bottom',
    CENTER_X: 'center-x',
    CENTER_Y: 'center-y',
};

const SNAP_TYPE_ORDER = {
    [SNAP_TYPES.EDGE_LEFT]: 0,
    [SNAP_TYPES.EDGE_RIGHT]: 0,
    [SNAP_TYPES.EDGE_TOP]: 0,
    [SNAP_TYPES.EDGE_BOTTOM]: 0,
    [SNAP_TYPES.CENTER_X]: 1,
    [SNAP_TYPES.CENTER_Y]: 1,
};

export function computeSnapCandidates({ movingBounds, targets, snapRadius }) {
    if (!movingBounds || !Array.isArray(targets) || snapRadius <= 0) {
        return [];
    }

    const moving = rectMetrics(movingBounds);
    const candidates = [];

    targets.forEach((node) => {
        if (!node?.id) return;
        const targetBounds = rectFromNode(node);
        const target = rectMetrics(targetBounds);

        // X axis edges + center
        addCandidate(candidates, node.id, SNAP_TYPES.EDGE_LEFT, target.left - moving.left, snapRadius, targetBounds);
        addCandidate(candidates, node.id, SNAP_TYPES.EDGE_RIGHT, target.right - moving.right, snapRadius, targetBounds);
        addCandidate(candidates, node.id, SNAP_TYPES.EDGE_LEFT, target.right - moving.left, snapRadius, targetBounds);
        addCandidate(candidates, node.id, SNAP_TYPES.EDGE_RIGHT, target.left - moving.right, snapRadius, targetBounds);
        addCandidate(candidates, node.id, SNAP_TYPES.CENTER_X, target.cx - moving.cx, snapRadius, targetBounds);

        // Y axis edges + center
        addCandidate(candidates, node.id, SNAP_TYPES.EDGE_TOP, target.top - moving.top, snapRadius, targetBounds);
        addCandidate(candidates, node.id, SNAP_TYPES.EDGE_BOTTOM, target.bottom - moving.bottom, snapRadius, targetBounds);
        addCandidate(candidates, node.id, SNAP_TYPES.EDGE_TOP, target.bottom - moving.top, snapRadius, targetBounds);
        addCandidate(candidates, node.id, SNAP_TYPES.EDGE_BOTTOM, target.top - moving.bottom, snapRadius, targetBounds);
        addCandidate(candidates, node.id, SNAP_TYPES.CENTER_Y, target.cy - moving.cy, snapRadius, targetBounds);
    });

    return candidates.sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        const aOrder = SNAP_TYPE_ORDER[a.type] ?? 2;
        const bOrder = SNAP_TYPE_ORDER[b.type] ?? 2;
        if (aOrder !== bOrder) return aOrder - bOrder;
        if (a.targetId === b.targetId) return 0;
        return a.targetId < b.targetId ? -1 : 1;
    });
}

export function resolveSnapDelta({ candidates }) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
        return {
            delta: { x: 0, y: 0 },
            primaryX: null,
            primaryY: null,
        };
    }

    const xCandidates = candidates.filter((c) => isXType(c.type));
    const yCandidates = candidates.filter((c) => isYType(c.type));

    const primaryX = pickBestCandidate(xCandidates);
    const primaryY = pickBestCandidate(yCandidates);

    return {
        delta: {
            x: primaryX ? primaryX.delta.x : 0,
            y: primaryY ? primaryY.delta.y : 0,
        },
        primaryX,
        primaryY,
    };
}

export function buildSnapGuides({ primaryX, primaryY }) {
    const guides = [];

    if (primaryX) {
        const x = guideX(primaryX);
        if (x != null) {
            guides.push({
                id: `snap-x-${primaryX.type}-${primaryX.targetId}`,
                type: 'vertical',
                x,
                meta: primaryX,
            });
        }
    }

    if (primaryY) {
        const y = guideY(primaryY);
        if (y != null) {
            guides.push({
                id: `snap-y-${primaryY.type}-${primaryY.targetId}`,
                type: 'horizontal',
                y,
                meta: primaryY,
            });
        }
    }

    return guides;
}

function addCandidate(list, targetId, type, delta, snapRadius, bounds) {
    const distance = Math.abs(delta);
    if (distance > snapRadius) return;

    const candidate = {
        targetId,
        type,
        delta: isXType(type) ? { x: delta, y: 0 } : { x: 0, y: delta },
        distance,
        bounds: {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
        },
    };

    list.push(candidate);
}

function pickBestCandidate(list) {
    if (!list.length) return null;
    return list.sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        const aOrder = SNAP_TYPE_ORDER[a.type] ?? 2;
        const bOrder = SNAP_TYPE_ORDER[b.type] ?? 2;
        if (aOrder !== bOrder) return aOrder - bOrder;
        if (a.targetId === b.targetId) return 0;
        return a.targetId < b.targetId ? -1 : 1;
    })[0];
}

function rectFromNode(node) {
    return {
        x: node.x ?? 0,
        y: node.y ?? 0,
        width: node.width ?? 0,
        height: node.height ?? 0,
    };
}

function rectMetrics(rect) {
    return {
        left: rect.x,
        right: rect.x + rect.width,
        top: rect.y,
        bottom: rect.y + rect.height,
        cx: rect.x + rect.width / 2,
        cy: rect.y + rect.height / 2,
    };
}

function isXType(type) {
    return type === SNAP_TYPES.EDGE_LEFT || type === SNAP_TYPES.EDGE_RIGHT || type === SNAP_TYPES.CENTER_X;
}

function isYType(type) {
    return type === SNAP_TYPES.EDGE_TOP || type === SNAP_TYPES.EDGE_BOTTOM || type === SNAP_TYPES.CENTER_Y;
}

function guideX(candidate) {
    if (!candidate?.bounds) return null;
    if (candidate.type === SNAP_TYPES.EDGE_LEFT) return candidate.bounds.x;
    if (candidate.type === SNAP_TYPES.EDGE_RIGHT) return candidate.bounds.x + candidate.bounds.width;
    if (candidate.type === SNAP_TYPES.CENTER_X) return candidate.bounds.x + candidate.bounds.width / 2;
    return null;
}

function guideY(candidate) {
    if (!candidate?.bounds) return null;
    if (candidate.type === SNAP_TYPES.EDGE_TOP) return candidate.bounds.y;
    if (candidate.type === SNAP_TYPES.EDGE_BOTTOM) return candidate.bounds.y + candidate.bounds.height;
    if (candidate.type === SNAP_TYPES.CENTER_Y) return candidate.bounds.y + candidate.bounds.height / 2;
    return null;
}
