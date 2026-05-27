// core/events/reducers/layoutReducers.js

import { EventTypes } from '../eventTypes.js';
import { markLayoutDirty } from './layoutDirtyHelpers.js';

function getSceneNodes(state) {
    return state?.document?.sceneGraph?.nodes ?? {};
}

function getLayoutSystem(state) {
    return state?.document?.layout ?? null;
}

function getLayoutEntry(state, nodeId) {
    return getLayoutSystem(state)?.nodes?.[nodeId] ?? {};
}

function applyLayoutNodes(state, nextLayoutNodes) {
    const document = state?.document;
    if (!document?.layout) return state;

    return {
        ...state,
        document: {
            ...document,
            layout: {
                ...document.layout,
                nodes: nextLayoutNodes,
            },
        },
    };
}

function applyExplicitSizeToSizing(nextLayout, update = {}) {
    const next = { ...nextLayout };

    if (update.width != null) {
        next.sizing = {
            ...(next.sizing ?? {}),
            width: {
                ...(next.sizing?.width ?? {}),
                mode: next.sizing?.width?.mode ?? 'fixed',
                value: update.width,
            },
        };
    }

    if (update.height != null) {
        next.sizing = {
            ...(next.sizing ?? {}),
            height: {
                ...(next.sizing?.height ?? {}),
                mode: next.sizing?.height?.mode ?? 'fixed',
                value: update.height,
            },
        };
    }

    return next;
}

function computeAlignmentBounds(nodes = []) {
    if (!Array.isArray(nodes) || nodes.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
        const layout = node?.layout ?? {};
        const x = layout.x ?? 0;
        const y = layout.y ?? 0;
        const width = layout.width ?? 0;
        const height = layout.height ?? 0;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    });

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
        return null;
    }

    return {
        minX,
        minY,
        maxX,
        maxY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
    };
}

function alignLayoutNodes(nodes = [], alignment) {
    if (!Array.isArray(nodes) || nodes.length < 2) return [];
    const ordered = [...nodes].sort((a, b) => String(a?.id).localeCompare(String(b?.id)));
    const bounds = computeAlignmentBounds(ordered);
    if (!bounds) return [];

    return ordered.map((node) => {
        const layout = node?.layout ?? {};
        const width = layout.width ?? 0;
        const height = layout.height ?? 0;
        let x = layout.x ?? 0;
        let y = layout.y ?? 0;

        switch (alignment) {
            case 'alignLeft':
                x = bounds.minX;
                break;
            case 'alignRight':
                x = bounds.maxX - width;
                break;
            case 'alignCenterX':
                x = bounds.centerX - width / 2;
                break;
            case 'alignTop':
                y = bounds.minY;
                break;
            case 'alignBottom':
                y = bounds.maxY - height;
                break;
            case 'alignCenterY':
                y = bounds.centerY - height / 2;
                break;
            default:
                break;
        }

        return { id: node.id, x, y };
    });
}

function distributeLayoutNodes(nodes = [], axis) {
    if (!Array.isArray(nodes) || nodes.length < 3) return [];
    const ordered = [...nodes].sort((a, b) => {
        const la = a?.layout ?? {};
        const lb = b?.layout ?? {};
        const ap = axis === 'x' ? (la.x ?? 0) : (la.y ?? 0);
        const bp = axis === 'x' ? (lb.x ?? 0) : (lb.y ?? 0);
        if (ap !== bp) return ap - bp;
        return String(a?.id).localeCompare(String(b?.id));
    });

    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    if (!first || !last) return [];

    const firstLayout = first.layout ?? {};
    const lastLayout = last.layout ?? {};
    const start = axis === 'x' ? (firstLayout.x ?? 0) : (firstLayout.y ?? 0);
    const end = axis === 'x'
        ? (lastLayout.x ?? 0) + (lastLayout.width ?? 0)
        : (lastLayout.y ?? 0) + (lastLayout.height ?? 0);
    const totalSize = ordered.reduce((sum, node) => {
        const layout = node?.layout ?? {};
        return sum + (axis === 'x' ? (layout.width ?? 0) : (layout.height ?? 0));
    }, 0);
    const gap = (end - start - totalSize) / (ordered.length - 1);

    let cursor = start;
    return ordered.map((node) => {
        const layout = node?.layout ?? {};
        const width = layout.width ?? 0;
        const height = layout.height ?? 0;
        const next = axis === 'x'
            ? { x: cursor, y: layout.y ?? 0 }
            : { x: layout.x ?? 0, y: cursor };
        cursor += (axis === 'x' ? width : height) + gap;
        return { id: node.id, x: next.x, y: next.y };
    });
}

export function layoutReducers(state, event) {
    const { type, payload } = event;
    const sceneNodes = getSceneNodes(state);

    switch (type) {
        case EventTypes.NODE_MOVE: {
            const { id, xDelta, yDelta } = payload;
            const node = sceneNodes[id];
            if (!node) return state;

            const prevLayout = getLayoutEntry(state, id);

            return markLayoutDirty(applyLayoutNodes(state, {
                ...(getLayoutSystem(state)?.nodes ?? {}),
                [id]: {
                    ...prevLayout,
                    x: (prevLayout.x ?? 0) + xDelta,
                    y: (prevLayout.y ?? 0) + yDelta,
                },
            }), {
                nodeIds: [id],
            });
        }

        case EventTypes.ALIGN_NODES: {
            const { alignment, nodeIds } = payload || {};
            if (!alignment || !Array.isArray(nodeIds) || nodeIds.length < 2) return state;

            const nextLayoutNodes = {
                ...(getLayoutSystem(state)?.nodes ?? {}),
            };
            const targets = nodeIds
                .map((id) => {
                    const layout = nextLayoutNodes[id];
                    return layout ? { id, layout } : null;
                })
                .filter(Boolean);
            if (targets.length < 2) return state;

            const updates = alignLayoutNodes(targets, alignment);
            if (!Array.isArray(updates) || updates.length === 0) return state;

            updates.forEach((update) => {
                const prevLayout = nextLayoutNodes[update.id] ?? {};
                nextLayoutNodes[update.id] = {
                    ...prevLayout,
                    x: update.x,
                    y: update.y,
                };
            });

            return markLayoutDirty(applyLayoutNodes(state, nextLayoutNodes), {
                nodeIds: updates.map((update) => update.id),
            });
        }

        case EventTypes.DISTRIBUTE_NODES: {
            const { axis, nodeIds } = payload || {};
            if (!axis || !Array.isArray(nodeIds) || nodeIds.length < 3) return state;

            const nextLayoutNodes = {
                ...(getLayoutSystem(state)?.nodes ?? {}),
            };
            const targets = nodeIds
                .map((id) => {
                    const layout = nextLayoutNodes[id];
                    return layout ? { id, layout } : null;
                })
                .filter(Boolean);
            if (targets.length < 3) return state;

            const updates = distributeLayoutNodes(targets, axis);
            if (!Array.isArray(updates) || updates.length === 0) return state;

            updates.forEach((update) => {
                const prevLayout = nextLayoutNodes[update.id] ?? {};
                nextLayoutNodes[update.id] = {
                    ...prevLayout,
                    x: update.x,
                    y: update.y,
                };
            });

            return markLayoutDirty(applyLayoutNodes(state, nextLayoutNodes), {
                nodeIds: updates.map((update) => update.id),
            });
        }

        case 'node.layout.update': {
            const { nodeId, layout } = payload;
            const node = sceneNodes[nodeId];
            if (!node) return state;

            const prevLayout = getLayoutEntry(state, nodeId);

            return markLayoutDirty(applyLayoutNodes(state, {
                ...(getLayoutSystem(state)?.nodes ?? {}),
                [nodeId]: {
                    ...prevLayout,
                    ...(layout || {}),
                },
            }), {
                nodeIds: [nodeId],
            });
        }

        case 'node.layout.bulk': {
            const { updates } = payload || {};
            if (!Array.isArray(updates) || updates.length === 0) return state;

            const nextLayoutNodes = {
                ...(getLayoutSystem(state)?.nodes ?? {}),
            };

            updates.forEach((update) => {
                const nodeId = update?.id;
                if (!nodeId) return;
                const node = sceneNodes[nodeId];
                if (!node) return;

                const prevLayout = nextLayoutNodes[nodeId] ?? {};
                const nextLayout = {
                    ...prevLayout,
                    ...(update.layout || {}),
                };

                if (update.x != null) nextLayout.x = update.x;
                if (update.y != null) nextLayout.y = update.y;
                if (update.width != null) nextLayout.width = update.width;
                if (update.height != null) nextLayout.height = update.height;

                nextLayoutNodes[nodeId] = applyExplicitSizeToSizing(nextLayout, update);
            });

            return markLayoutDirty(applyLayoutNodes(state, nextLayoutNodes), {
                nodeIds: updates
                    .map((update) => update?.id)
                    .filter(Boolean),
            });
        }

        case 'node.layout.setConstraint': {
            const { nodeId, constraint } = payload;
            const node = sceneNodes[nodeId];
            if (!node) return state;

            const prevLayout = getLayoutEntry(state, nodeId);
            const prevConstraints = prevLayout.constraints || {};

            return markLayoutDirty(applyLayoutNodes(state, {
                ...(getLayoutSystem(state)?.nodes ?? {}),
                [nodeId]: {
                    ...prevLayout,
                    constraints: {
                        ...prevConstraints,
                        ...(constraint || {}),
                    },
                },
            }), {
                nodeIds: [nodeId],
            });
        }

        case 'node.layout.clearConstraint': {
            const { nodeId, key } = payload;
            const node = sceneNodes[nodeId];
            if (!node) return state;

            const prevLayout = getLayoutEntry(state, nodeId);
            const prevConstraints = prevLayout.constraints || {};
            const nextConstraints = { ...prevConstraints };
            delete nextConstraints[key];

            return markLayoutDirty(applyLayoutNodes(state, {
                ...(getLayoutSystem(state)?.nodes ?? {}),
                [nodeId]: {
                    ...prevLayout,
                    constraints: nextConstraints,
                },
            }), {
                nodeIds: [nodeId],
            });
        }

        case 'node.layout.setAutoLayout': {
            const { nodeId, config } = payload;
            const node = sceneNodes[nodeId];
            if (!node) return state;

            const prevLayout = getLayoutEntry(state, nodeId);
            const nextAutoLayout =
                config?.type === 'grid'
                    ? {
                          type: 'grid',
                          columns: 3,
                          rows: 'auto',
                          gap: 8,
                          padding: 8,
                          align: 'start',
                          justify: 'start',
                          ...config,
                      }
                    : {
                          type: 'flex',
                          direction: 'row',
                          gap: 8,
                          padding: 8,
                          align: 'start',
                          justify: 'start',
                          ...config,
                      };

            return markLayoutDirty(applyLayoutNodes(state, {
                ...(getLayoutSystem(state)?.nodes ?? {}),
                [nodeId]: {
                    ...prevLayout,
                    autoLayout: nextAutoLayout,
                },
            }), {
                nodeIds: [nodeId],
            });
        }

        case 'node.layout.clearAutoLayout': {
            const { nodeId } = payload;
            const node = sceneNodes[nodeId];
            if (!node) return state;

            const prevLayout = getLayoutEntry(state, nodeId);

            return markLayoutDirty(applyLayoutNodes(state, {
                ...(getLayoutSystem(state)?.nodes ?? {}),
                [nodeId]: {
                    ...prevLayout,
                    autoLayout: null,
                },
            }), {
                nodeIds: [nodeId],
            });
        }

        default:
            return state;
    }
}
