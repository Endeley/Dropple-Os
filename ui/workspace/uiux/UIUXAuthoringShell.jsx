'use client';

import '@/ui/styles/uiux.css';
import { useCallback } from 'react';

import { UIUXTopBar } from './UIUXTopBar.jsx';
import { UIUXToolRail } from './UIUXToolRail.jsx';
import { UIUXCanvasStage } from './UIUXCanvasStage.jsx';

import { PanelRenderer } from '@/ui/workspace/shell/PanelRenderer.jsx';
import { WorkspaceSessionsRoot } from '@/ui/workspace/root/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx';

import { nodeUpdateIntent } from '@/ui/inspector/nodeUpdateIntent.js';
import { useWorkspaceVisualState } from '@/runtime/projection';
import { useWorkspaceCapabilities } from '@/ui/workspace/useWorkspaceCapabilities.js';
import { useCapabilityLifecycle } from '@/ui/workspace/useCapabilityLifecycle.js';
import { openTemplatePublishDialog } from '@/ui/bridges/templatePublishRuntimeFacade.js';

/**
 * Canonical product shell for design -> uiux.
 *
 * Constitutional rules:
 * - projection reads only
 * - emits intents only
 * - no execution authority
 * - shell owns product chrome
 */
export function UIUXAuthoringShell({ profile = 'uiux-authoring', modeId = 'uiux' }) {
    const emit = useCallback((event) => nodeUpdateIntent(event), []);

    const { capabilities } = useWorkspaceCapabilities({
        workspace: 'design',
        mode: 'uiux',
    });

    useCapabilityLifecycle({
        capabilities,
        emit,
        workspace: 'design',
        mode: 'uiux',
    });

    const nodes = useWorkspaceVisualState((s) => s.nodes || {});
    const selectedIds = useWorkspaceVisualState((s) => s.selection?.ids || []);
    const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
    const node = selectedId ? nodes[selectedId] : null;

    return (
        <div className='uiux-root' data-workspace='uiux'>
            <UIUXTopBar
                onPublish={() =>
                    openTemplatePublishDialog({
                        mode: {
                            id: modeId,
                            workspaceId: 'design',
                        },
                    })
                }
            />

            <div className='uiux-main'>
                <UIUXToolRail />
                <UIUXCanvasStage profile={profile} workspaceId='uiux' />
                <PanelRenderer workspaceId='uiux' node={node} emit={emit} />
            </div>

            <WorkspaceSessionsRoot modeId={modeId} />
        </div>
    );
}
