/**
 * DERIVED LAYOUT PASS
 *
 * ⚠️ This function computes derived presentation state ONLY.
 *
 * RULES:
 * - Must be pure and deterministic
 * - Must NOT emit events
 * - Must NOT mutate history
 * - Must NOT introduce side effects
 * - Safe to re-run at any time
 *
 * Layout output is NOT persisted and NOT replayed.
 */

import { computeFlexLayout } from './computeFlexLayout.js';
import { computeGridLayout } from './computeGridLayout.js';

function safeNumber(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

function resolveIntent(layoutValue, legacyValue, fallback) {
    if (layoutValue != null) return layoutValue;
    if (legacyValue != null) return legacyValue;
    return fallback;
}

function deriveAutoLayout(layout) {
    if (layout?.autoLayout) return layout.autoLayout;

    if (layout?.display === 'flex') {
        return {
            type: 'flex',
            direction: layout.flexDirection ?? 'row',
            gap: layout.gap ?? 0,
            padding: layout.padding ?? 0,
            align: 'start',
            justify: 'start',
        };
    }

    if (layout?.display === 'grid') {
        let columns = 3;
        const raw = typeof layout.gridTemplateColumns === 'string'
            ? layout.gridTemplateColumns.trim()
            : '';
        if (raw) {
            const count = raw.split(/\s+/).filter(Boolean).length;
            if (Number.isFinite(count) && count > 0) {
                columns = count;
            }
        } else if (Number.isFinite(layout.columns)) {
            columns = layout.columns;
        }

        return {
            type: 'grid',
            columns,
            rows: 'auto',
            gap: layout.gap ?? 0,
            padding: layout.padding ?? 0,
            align: 'start',
            justify: 'start',
        };
    }

    return null;
}

export function applyLayoutPass(runtimeState) {
    if (!runtimeState || !runtimeState.nodes) {
        return { nodes: {}, rootIds: [] };
    }

    const derivedNodes = {};
    const nodes = runtimeState.nodes;

    for (const id in nodes) {
        const node = nodes[id];
        const layout = node.layout || {};

        const x = safeNumber(
            resolveIntent(layout.x, node.x, 0),
            0
        );
        const y = safeNumber(
            resolveIntent(layout.y, node.y, 0),
            0
        );
        const width = safeNumber(
            resolveIntent(layout.width, node.width, 100),
            100
        );
        const height = safeNumber(
            resolveIntent(layout.height, node.height, 100),
            100
        );

        // IMPORTANT:
        // Layout may only COMPUTE geometry.
        // It must never invent semantic state.
        derivedNodes[id] = {
            ...node,
            x,
            y,
            width,
            height,
        };
    }

    for (const id in nodes) {
        const node = nodes[id];
        const layout = node.layout || {};
        const autoLayout = deriveAutoLayout(layout);
        if (!autoLayout) continue;

        const childIds = Array.isArray(node.children) ? node.children : [];
        if (!childIds.length) continue;

        const children = childIds
            .map((childId) => derivedNodes[childId])
            .filter(Boolean)
            .map((child) => ({
                id: child.id,
                layout: {
                    width: child.width,
                    height: child.height,
                },
            }));

        if (!children.length) continue;

        const container = {
            layout: {
                autoLayout,
                width: derivedNodes[id]?.width ?? 0,
                height: derivedNodes[id]?.height ?? 0,
            },
        };

        const positions =
            autoLayout.type === 'grid'
                ? computeGridLayout(container, children)
                : computeFlexLayout(container, children);

        positions.forEach(({ nodeId, x, y }) => {
            const child = derivedNodes[nodeId];
            if (!child) return;
            const containerX = derivedNodes[id]?.x ?? 0;
            const containerY = derivedNodes[id]?.y ?? 0;
            derivedNodes[nodeId] = {
                ...child,
                x: containerX + x,
                y: containerY + y,
            };
        });
    }

    return {
        nodes: derivedNodes,
        rootIds: runtimeState.rootIds || [],
    };
}
