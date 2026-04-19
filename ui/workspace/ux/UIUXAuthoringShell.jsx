'use client';
import '@/ui/styles/uiux.css';
import { useCallback, useMemo, useState } from 'react';
import { UIUXTopBar } from './UIUXTopBar.jsx';
import { UIUXToolRail } from './UIUXToolRail.jsx';
import { UIUXCanvasStage } from './UIUXCanvasStage.jsx';
import { PanelRenderer } from '@/ui/workspace/shell/PanelRenderer.jsx';
import { WorkspaceSessionsRoot } from '@/ui/workspace/root/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx';
import { nodeUpdateIntent } from '@/ui/inspector/nodeUpdateIntent.js';
import { useWorkspaceVisualState } from '@/runtime/projection';
import { CertifiedTemplatesPanel } from '@/ui/workspace/ux/panels/CertifiedTemplatesPanel.jsx';
import { useWorkspaceCapabilities } from '@/ui/workspace/useWorkspaceCapabilities.js';
import { useCapabilityLifecycle } from '@/ui/workspace/useCapabilityLifecycle.js';

/**
 * UIUXAuthoringShell
 *
 * Authoring UX / UI workspace.
 * Allowed to mount input/session bindings and emit intents.
 */
export function UIUXAuthoringShell({ profile = 'uiux-authoring', modeId = 'uiux' }) {
  const emit = useCallback((event) => nodeUpdateIntent(event), []);
  const { capabilities } = useWorkspaceCapabilities({
    workspace: 'design',
    mode: 'uiux',
  });
  const nodes = useWorkspaceVisualState((s) => s.nodes || {});
  const selectedIds = useWorkspaceVisualState((s) => s.selection?.ids || []);
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const node = selectedId ? nodes[selectedId] : null;
  const [templatesOpen, setTemplatesOpen] = useState(false);

  useCapabilityLifecycle({
    capabilities,
    emit,
    workspace: 'design',
    mode: 'uiux',
  });

  const extraPanels = useMemo(() => {
    if (!templatesOpen) return [];
    return [
      {
        key: 'CertifiedTemplatesPanel',
        component: CertifiedTemplatesPanel,
        props: { mode: 'uiux' },
      },
    ];
  }, [templatesOpen]);

  return (
    <div className="uiux-root" data-workspace="uiux">
      <UIUXTopBar
        templatesOpen={templatesOpen}
        onToggleTemplates={() => setTemplatesOpen((prev) => !prev)}
      />
      <div className="uiux-main">
        <UIUXToolRail />
        <UIUXCanvasStage profile={profile} />
        <PanelRenderer
          workspaceId="uiux"
          node={node}
          emit={emit}
          extraPanels={extraPanels}
        />
      </div>
      <WorkspaceSessionsRoot modeId={modeId} />
    </div>
  );
}
