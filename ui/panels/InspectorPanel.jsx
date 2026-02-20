'use client';

import { InspectorSection } from '@/ui/inspector/InspectorSection.jsx';
import { NodeHeaderPanel } from '@/ui/inspector/NodeHeaderPanel.jsx';
import LayoutInspector from '@/ui/inspector/LayoutInspector.jsx';
import { ContentPanel } from '@/ui/inspector/ContentPanel.jsx';
import { SemanticsPanel } from '@/ui/inspector/SemanticsPanel.jsx';
import { MotionPanel } from '@/ui/inspector/MotionPanel.jsx';
import { ExportPreviewPanel } from '@/ui/inspector/ExportPreviewPanel.jsx';
import { colors, spacing } from '@/ui/tokens';

export function InspectorPanel({ node, emit }) {
    if (!node) {
        return (
            <div style={{ fontSize: 12, color: colors.textMuted }}>
                Select a node to inspect.
            </div>
        );
    }

    const childCount = node?.children?.length ?? 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <InspectorSection title="Node Header">
                <NodeHeaderPanel
                    node={node}
                    parentId={node?.parentId || null}
                    childCount={childCount}
                />
            </InspectorSection>

            <InspectorSection title="Layout" defaultOpen>
                <LayoutInspector node={node} emit={emit} />
            </InspectorSection>

            <InspectorSection title="Content" defaultOpen>
                <ContentPanel node={node} emit={emit} />
            </InspectorSection>

            <InspectorSection title="Semantics" defaultOpen>
                <SemanticsPanel node={node} emit={emit} />
            </InspectorSection>

            <InspectorSection title="Motion (Read-Only)" defaultOpen={false}>
                <MotionPanel node={node} />
            </InspectorSection>

            <InspectorSection title="Export Preview" defaultOpen={false}>
                <ExportPreviewPanel node={node} />
            </InspectorSection>
        </div>
    );
}
