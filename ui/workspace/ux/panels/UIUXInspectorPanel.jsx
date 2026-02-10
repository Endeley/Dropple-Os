'use client';

import { useCallback, useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useSelectionStore } from '@/selection/useSelectionStore.js';
import { useDispatcher } from '@/workspace/WorkspaceRoot/DispatcherProvider/DispatcherContext.jsx';
import { InspectorSection } from '@/ui/inspector/InspectorSection.jsx';
import { NodeHeaderPanel } from '@/ui/inspector/NodeHeaderPanel.jsx';
import LayoutInspector from '@/ui/inspector/LayoutInspector.jsx';
import { AutoLayoutPanel } from '@/ui/inspector/AutoLayoutPanel.jsx';
import { ContentPanel } from '@/ui/inspector/ContentPanel.jsx';
import { SemanticsPanel } from '@/ui/inspector/SemanticsPanel.jsx';
import { MotionPanel } from '@/ui/inspector/MotionPanel.jsx';
import { ExportPreviewPanel } from '@/ui/inspector/ExportPreviewPanel.jsx';
import { colors, spacing } from '@/ui/tokens';

export function UIUXInspectorPanel() {
  const dispatcher = useDispatcher();
  const emit = useCallback((event) => dispatcher.dispatch(event), [dispatcher]);

  const nodes = useRuntimeStore((s) => s.nodes || {});
  const rootIds = useRuntimeStore((s) => s.rootIds || []);
  const selectedIds = useSelectionStore((s) => s.selectedIds || []);

  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const node = selectedId ? nodes[selectedId] : null;

  const parent = node?.parentId ? nodes[node.parentId] : null;
  const childCount = node?.children?.length ?? 0;

  const orderIndex = useMemo(() => {
    if (!node) return null;
    if (parent?.children?.length) {
      return parent.children.indexOf(node.id);
    }
    if (rootIds?.length) {
      return rootIds.indexOf(node.id);
    }
    return null;
  }, [node, parent, rootIds]);

  if (!node) {
    return (
      <div style={{ fontSize: 12, color: colors.textMuted }}>
        Select a node to inspect.
      </div>
    );
  }

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
        {orderIndex !== null && orderIndex >= 0 && (
          <div style={{ marginTop: spacing.sm, fontSize: 12, color: colors.textMuted }}>
            Order index: {orderIndex}
          </div>
        )}
        <div style={{ marginTop: spacing.sm }}>
          <AutoLayoutPanel node={node} emit={emit} />
        </div>
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
