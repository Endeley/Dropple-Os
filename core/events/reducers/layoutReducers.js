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
