'use client';

import { useMemo, useRef } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';
import { getNearRadius } from '@/ui/canvas/nearest/nearRadius.js';
import { findNearestNodes } from '@/ui/canvas/nearest/nearestWorldNodes.js';

export function useNearestWorldObjects({
    worldPoint,
    enabled = true,
    maxResults = 5,
} = {}) {
    const nodesById = useRuntimeStore((state) => state.nodes);
    const { zoomTier } = useCanvasContext();
    const radius = getNearRadius(zoomTier);

    const rawResults = useMemo(() => {
        if (!enabled || !worldPoint) return [];
        const results = findNearestNodes({
            worldPoint,
            nodes: Object.values(nodesById || {}),
            radius,
            maxResults,
        });

        return results.map((entry) => ({
            id: entry.node.id,
            distance: entry.distance,
            relation: entry.relation,
            bounds: {
                x: entry.bounds.x,
                y: entry.bounds.y,
                width: entry.bounds.width,
                height: entry.bounds.height,
            },
        }));
    }, [enabled, worldPoint?.x, worldPoint?.y, nodesById, radius, maxResults]);

    const stableRef = useRef({
        nearest: [],
        primary: null,
        radius,
        tier: zoomTier,
    });

    if (!enabled || !worldPoint) {
        stableRef.current = {
            nearest: [],
            primary: null,
            radius,
            tier: zoomTier,
        };
        return stableRef.current;
    }

    const prev = stableRef.current;
    const sameTier = prev.tier === zoomTier;
    const sameRadius = prev.radius === radius;
    const sameList = shallowEqualResults(prev.nearest, rawResults);

    if (sameTier && sameRadius && sameList) {
        return prev;
    }

    const next = {
        nearest: rawResults,
        primary: rawResults[0] ?? null,
        radius,
        tier: zoomTier,
    };
    stableRef.current = next;
    return next;
}

function shallowEqualResults(a, b) {
    if (a === b) return true;
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
        const left = a[i];
        const right = b[i];
        if (!left || !right) return false;
        if (left.id !== right.id) return false;
        if (left.distance !== right.distance) return false;
        if (left.relation !== right.relation) return false;
        if (!rectEqual(left.bounds, right.bounds)) return false;
    }
    return true;
}

function rectEqual(a, b) {
    if (!a || !b) return false;
    return (
        a.x === b.x &&
        a.y === b.y &&
        a.width === b.width &&
        a.height === b.height
    );
}
