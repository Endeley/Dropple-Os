'use client';

/**
 * UXSelectionInsightPanel
 *
 * Read-only explanation of the current selection.
 * No mutation. No interaction. No subscriptions.
 */

import { useMemo } from 'react';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';

export function UXSelectionInsightPanel({
    events = [],
    cursorIndex = -1,
    selectionIds = [],
}) {
    const designState = useMemo(() => {
        if (!events || cursorIndex < 0) return null;
        return getDesignStateAtCursor(events, cursorIndex);
    }, [events, cursorIndex]);

    if (!selectionIds || selectionIds.length === 0) {
        return (
            <section style={{ padding: 12, fontSize: 12, opacity: 0.6 }}>
                No selection
            </section>
        );
    }

    const nodeId = selectionIds[0];
    const node = designState?.nodes?.[nodeId];

    if (!node) {
        return (
            <section style={{ padding: 12, fontSize: 12 }}>
                Selected node not found
            </section>
        );
    }

    return (
        <section style={{ padding: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Selection Insight
            </h3>

            <div style={{ fontSize: 12 }}>
                <div>
                    <strong>ID:</strong> {nodeId}
                </div>
                <div>
                    <strong>Type:</strong> {node.type}
                </div>
                <div>
                    <strong>Layout:</strong> {node.layout?.type ?? 'none'}
                </div>
                <div>
                    <strong>Constraints:</strong> {node.constraints ? 'Yes' : 'No'}
                </div>
                <div>
                    <strong>Interactions:</strong> {node.interactions?.length ?? 0}
                </div>
            </div>
        </section>
    );
}
