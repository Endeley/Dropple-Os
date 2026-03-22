'use client';

import { useCallback, useMemo } from 'react';
import { useWorkspaceVisualState } from '@/runtime/projection';
import { nodeUpdateIntent } from '@/ui/inspector/nodeUpdateIntent.js';
import { InspectorSection } from '@/ui/inspector/InspectorSection.jsx';
import { NodeHeaderPanel } from '@/ui/inspector/NodeHeaderPanel.jsx';
import LayoutInspector from '@/ui/inspector/LayoutInspector.jsx';
import { AutoLayoutPanel } from '@/ui/inspector/AutoLayoutPanel.jsx';
import { ContentPanel } from '@/ui/inspector/ContentPanel.jsx';
import { SemanticsPanel } from '@/ui/inspector/SemanticsPanel.jsx';
import { MotionPanel } from '@/ui/inspector/MotionPanel.jsx';
import { ExportPreviewPanel } from '@/ui/inspector/ExportPreviewPanel.jsx';
import { colors, spacing } from '@/ui/tokens';
import { Availability } from '@/ui/availability/availability';
import { useAvailability } from '@/ui/availability/useAvailability';
import { Capability } from '@/ui/capabilities/capabilityVocabulary';

export function UIUXInspectorPanel() {
  const emit = useCallback((event) => nodeUpdateIntent(event), []);

  const nodes = useWorkspaceVisualState((s) => s.nodes || {});
  const rootIds = useWorkspaceVisualState((s) => s.rootIds || []);
  const selectedIds = useWorkspaceVisualState((s) => s.selection?.ids || []);

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

  const nodeRead = useAvailability({
    readCaps: [Capability.NODE_READ],
  });
  const layoutAvail = useAvailability({
    readCaps: [Capability.LAYOUT_READ],
    writeCaps: [Capability.LAYOUT_WRITE],
  });
  const autoLayoutAvail = useAvailability({
    readCaps: [Capability.LAYOUT_READ, Capability.LAYOUT_AUTOLAYOUT],
    writeCaps: [Capability.LAYOUT_WRITE, Capability.LAYOUT_AUTOLAYOUT],
  });
  const contentAvail = useAvailability({
    readCaps: [Capability.CONTENT_READ],
    writeCaps: [Capability.CONTENT_WRITE],
  });
  const semanticsAvail = useAvailability({
    readCaps: [Capability.CONTENT_READ],
    writeCaps: [Capability.CONTENT_WRITE],
  });
  const motionAvail = useAvailability({
    readCaps: [Capability.MOTION_READ],
  });

  if (nodeRead === Availability.HIDDEN) {
    return (
      <div style={{ fontSize: 12, color: colors.textMuted }}>
        No access to inspect nodes in this workspace.
      </div>
    );
  }

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

      {layoutAvail !== Availability.HIDDEN && (
        <InspectorSection title="Layout" defaultOpen>
          <LayoutInspector
            node={node}
            emit={emit}
            readOnly={layoutAvail === Availability.READ_ONLY}
          />
          {orderIndex !== null && orderIndex >= 0 && (
            <div style={{ marginTop: spacing.sm, fontSize: 12, color: colors.textMuted }}>
              Order index: {orderIndex}
            </div>
          )}
          {autoLayoutAvail !== Availability.HIDDEN && (
            <div style={{ marginTop: spacing.sm }}>
              <AutoLayoutPanel
                node={node}
                emit={emit}
                readOnly={autoLayoutAvail === Availability.READ_ONLY}
              />
            </div>
          )}
        </InspectorSection>
      )}

      {contentAvail !== Availability.HIDDEN && (
        <InspectorSection title="Content" defaultOpen>
          <ContentPanel
            node={node}
            emit={emit}
            readOnly={contentAvail === Availability.READ_ONLY}
          />
        </InspectorSection>
      )}

      {semanticsAvail !== Availability.HIDDEN && (
        <InspectorSection title="Semantics" defaultOpen>
          <SemanticsPanel
            node={node}
            emit={emit}
            readOnly={semanticsAvail === Availability.READ_ONLY}
          />
        </InspectorSection>
      )}

      {motionAvail !== Availability.HIDDEN && (
        <InspectorSection title="Motion (Read-Only)" defaultOpen={false}>
          <MotionPanel node={node} />
        </InspectorSection>
      )}

      <InspectorSection title="Export Preview" defaultOpen={false}>
        <ExportPreviewPanel node={node} />
      </InspectorSection>
    </div>
  );
}
