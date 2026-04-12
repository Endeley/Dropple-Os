function clamp01(value) {
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function cloneNode(node) {
    if (!node || typeof node !== 'object') return node;
    return {
        ...node,
        children: Array.isArray(node.children) ? node.children.map(cloneNode) : [],
    };
}

function shortestAngleLerp(a, b, t) {
    const delta = ((((b - a) % 360) + 540) % 360) - 180;
    return a + delta * t;
}

function mergeChildren(childrenA = [], childrenB = []) {
    const byId = new Map();

    for (const child of childrenA) {
        if (child?.id) byId.set(child.id, { left: child, right: null });
    }
    for (const child of childrenB) {
        if (!child?.id) continue;
        const current = byId.get(child.id);
        byId.set(child.id, { left: current?.left ?? null, right: child });
    }

    return [...byId.entries()]
        .sort((left, right) => String(left[0]).localeCompare(String(right[0])))
        .map(([, pair]) => pair);
}

function composeNode(nodeA, nodeB, t) {
    if (nodeA && !nodeB) {
        const next = cloneNode(nodeA);
        next.opacity = lerp(safeNumber(nodeA.opacity, 1), 0, t);
        return next;
    }

    if (!nodeA && nodeB) {
        const next = cloneNode(nodeB);
        next.opacity = lerp(0, safeNumber(nodeB.opacity, 1), t);
        return next;
    }

    if (!nodeA && !nodeB) return null;

    const next = {
        ...(nodeA ?? {}),
        ...(nodeB ?? {}),
        id: nodeA?.id ?? nodeB?.id ?? null,
        x: lerp(safeNumber(nodeA?.x), safeNumber(nodeB?.x), t),
        y: lerp(safeNumber(nodeA?.y), safeNumber(nodeB?.y), t),
        opacity: lerp(safeNumber(nodeA?.opacity, 1), safeNumber(nodeB?.opacity, 1), t),
        rotation: shortestAngleLerp(
            safeNumber(nodeA?.rotation),
            safeNumber(nodeB?.rotation),
            t,
        ),
        scale: lerp(safeNumber(nodeA?.scale, 1), safeNumber(nodeB?.scale, 1), t),
    };

    const childPairs = mergeChildren(nodeA?.children, nodeB?.children);
    next.children = childPairs
        .map(({ left, right }) => composeNode(left, right, t))
        .filter(Boolean);

    return next;
}

export function composeSceneTransition({
    sceneA,
    sceneB,
    transition,
    t,
} = {}) {
    const progress = clamp01(safeNumber(t));

    if (!transition || transition?.type === 'cut') {
        return cloneNode(progress < 1 ? sceneA : sceneB);
    }

    if (transition.type !== 'crossfade') {
        throw new Error(`composeSceneTransition: unsupported transition type ${transition.type}`);
    }

    return composeNode(sceneA, sceneB, progress);
}
