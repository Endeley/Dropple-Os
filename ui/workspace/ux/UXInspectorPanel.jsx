'use client';

import { UXEventListPanel } from './panels/UXEventListPanel';
import { UXSelectionInsightPanel } from './panels/UXSelectionInsightPanel';
import { UXRiskImpactPanel } from './panels/UXRiskImpactPanel';
import { CanvasSurfacePanel } from './panels/CanvasSurfacePanel';

export function UXInspectorPanel({ events, cursor, selection }) {
    return (
        <aside
            style={{
                width: 360,
                height: '100%',
                borderLeft: '1px solid #e5e7eb',
                overflow: 'auto',
                background: '#fff',
            }}>
            <UXEventListPanel events={events} cursorIndex={cursor?.index ?? -1} />
            <UXSelectionInsightPanel
                events={events}
                cursorIndex={cursor?.index ?? -1}
                selectionIds={selection?.ids ?? []}
            />
            <UXRiskImpactPanel />
            <CanvasSurfacePanel />
        </aside>
    );
}
