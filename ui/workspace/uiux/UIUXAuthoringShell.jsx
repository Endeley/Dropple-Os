'use client';

import '@/ui/styles/uiux.css';
import { useCallback, useState } from 'react';

import { UIUXTopBar } from './UIUXTopBar.jsx';
import { UIUXToolRail } from './UIUXToolRail.jsx';
import { UIUXCanvasStage } from './UIUXCanvasStage.jsx';

import { PanelRenderer } from '@/ui/workspace/shell/PanelRenderer.jsx';
import { WorkspaceSessionsRoot } from '@/ui/workspace/root/DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx';

import { nodeUpdateIntent } from '@/ui/inspector/nodeUpdateIntent.js';
import { useWorkspaceProjectionState, useWorkspaceVisualState } from '@/runtime/projection';
import { useWorkspaceCapabilities } from '@/ui/workspace/useWorkspaceCapabilities.js';
import { useCapabilityLifecycle } from '@/ui/workspace/useCapabilityLifecycle.js';
import { openTemplatePublishDialog } from '@/ui/bridges/templatePublishRuntimeFacade.js';
import { PersistenceBridge } from '@/ui/bridges/PersistenceBridge.jsx';
import { TokenCssBridge } from '@/ui/bridges/tokenCssBridge.js';
import { TemplateMotionInspectorPanel } from './TemplateMotionInspectorPanel.jsx';
import { UIUXTransitionTimelinePanel } from './UIUXTransitionTimelinePanel.jsx';
import { useKeyboardNudge } from '@/ui/keyboard/useKeyboardNudge';
import { useAlignmentShortcuts } from '@/ui/keyboard/useAlignmentShortcuts';
import {
    resolveDesignWorkspaceContext,
    buildDesignPublishModePayload,
    resolveDesignModeCapabilitySurface,
    DesignWorkspaceStrip,
} from '@/ui/workspace/design/DesignShellPrimitives.jsx';

export function UIUXAuthoringShell({
    profile = 'uiux-authoring',
    modeId = 'uiux',
    workspaceContext = null,
    initialEnvironmentDescriptor = null,
    initialResolvedTemplateEnvironment = null,
    initialRuntimeSnapshot = null,
    initialEvents = [],
    initialCursorIndex = -1,
    initialDocumentId = null,
}) {
    const emit = useCallback((event) => nodeUpdateIntent(event), []);
    const [documentId, setDocumentId] = useState(null);
    const [documentName, setDocumentName] = useState('Untitled');

    const resolvedDesignContext = resolveDesignWorkspaceContext({ modeId, workspaceContext });
    const resolvedModeId = resolvedDesignContext.modeId;
    const resolvedWorkspaceId = resolvedDesignContext.workspaceId;
    const publishModePayload = buildDesignPublishModePayload(resolvedDesignContext);
    const capabilitySurface = resolveDesignModeCapabilitySurface(resolvedModeId);

    const { capabilities } = useWorkspaceCapabilities({
        workspace: resolvedWorkspaceId,
        mode: resolvedModeId,
    });

    useCapabilityLifecycle({
        capabilities,
        emit,
        workspace: resolvedWorkspaceId,
        mode: resolvedModeId,
    });

    const nodes = useWorkspaceVisualState((s) => s.nodes || {});
    const selectedIds = useWorkspaceVisualState((s) => s.selection?.ids || []);
    const motionClipCount = useWorkspaceProjectionState((s) => Object.keys(s?.document?.motion?.clips || {}).length);

    const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;

    const node = selectedId ? nodes[selectedId] : null;

    useKeyboardNudge({
        enabled: true,
        emit,
        getState: () => ({ nodes }),
        selectedIds,
    });

    useAlignmentShortcuts({
        enabled: true,
        emit,
        getState: () => ({ nodes }),
        selectedIds,
    });

    return (
        <>
            <TokenCssBridge />

            <PersistenceBridge
                enabled={true}
                initialDocumentId={initialDocumentId}
                initialEnvironmentDescriptor={initialEnvironmentDescriptor}
                initialResolvedTemplateEnvironment={initialResolvedTemplateEnvironment}
                initialRuntimeSnapshot={initialRuntimeSnapshot}
                initialEvents={initialEvents}
                initialCursorIndex={initialCursorIndex}
                documentId={documentId}
                documentName={documentName}
                onDocumentIdChange={setDocumentId}
                onDocumentNameChange={setDocumentName}
                workspace='design'
                mode={resolvedModeId}
            />

            <div className='uiux-root' data-workspace={resolvedModeId}>
                {/* Primary authoring chrome */}
                <header className='uiux-top-chrome'>
                    <UIUXTopBar
                        modeId={resolvedModeId}
                        onPublish={() =>
                                    openTemplatePublishDialog({
                                        mode: publishModePayload,
                                    })
                                }
                    />
                </header>

                {/* Secondary workspace strip */}
                <DesignWorkspaceStrip modeId={resolvedModeId} status='Draft' />

                {/* Main dock grid */}
                <div className='uiux-main-grid' data-testid='uiux-main-grid'>
                    <aside className='uiux-left-dock' data-testid='uiux-left-dock'>
                        <UIUXToolRail modeId={resolvedModeId} />
                    </aside>

                    <main className='uiux-canvas-dock' data-testid='uiux-canvas-dock'>
                        <UIUXCanvasStage profile={profile} workspaceId={resolvedModeId} />
                    </main>

                    <aside className='uiux-right-dock' data-testid='uiux-right-dock'>
                        <PanelRenderer
                            workspaceId={resolvedModeId}
                            node={node}
                            emit={emit}
                            extraPanels={
                                capabilitySurface.showMotionInspector && (Boolean(node?.id) || motionClipCount > 0)
                                    ? [
                                          {
                                              key: 'uiux-motion-runtime',
                                              component: TemplateMotionInspectorPanel,
                                              props: {
                                                  nodeId: node?.id ?? null,
                                              },
                                          },
                                      ]
                                    : []
                            }
                        />
                    </aside>
                </div>

                {/* Reserved bottom dock for design timeline */}
                {capabilitySurface.showTransitionTimeline ? (
                    <footer
                        className='uiux-bottom-dock'
                        data-testid='uiux-bottom-dock'
                        data-surface='timeline'
                        data-context-visibility={node?.id ? 'expanded' : 'compact'}>
                        <UIUXTransitionTimelinePanel node={node} />
                    </footer>
                ) : null}

                <WorkspaceSessionsRoot modeId={resolvedModeId} />
            </div>
        </>
    );
}
