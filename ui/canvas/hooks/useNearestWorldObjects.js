'use client';

import { useMemo } from 'react';
import { useWorkspaceVisualState } from '@/runtime/projection';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';
import { getNearRadius } from '@/ui/canvas/nearest/nearRadius.js';
import { findNearestNodes } from '@/ui/canvas/nearest/nearestWorldNodes.js';

export function useNearestWorldObjects({
    worldPoint,
    enabled = true,
    maxResults = 5,
} = {}) {
    const nodesById = useWorkspaceVisualState((state) => state.nodes || {});
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
    }, [enabled, worldPoint, nodesById, radius, maxResults]);

    return useMemo(() => {
        if (!enabled || !worldPoint) {
            return {
                nearest: [],
                primary: null,
                radius,
                tier: zoomTier,
            };
        }

        return {
            nearest: rawResults,
            primary: rawResults[0] ?? null,
            radius,
            tier: zoomTier,
        };
    }, [enabled, worldPoint, rawResults, radius, zoomTier]);
}
