'use client';

import '@/ui/styles/uiux.css';
import { useCallback, useState } from 'react';

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
import { PersistenceBridge } from '@/ui/bridges/PersistenceBridge.jsx';
import { TokenCssBridge } from '@/ui/bridges/tokenCssBridge.js';
import { TemplateMotionInspectorPanel } from './TemplateMotionInspectorPanel.jsx';
import { UIUXTransitionTimelinePanel } from './UIUXTransitionTimelinePanel.jsx';
import { useKeyboardNudge } from '@/ui/keyboard/useKeyboardNudge';

export function UIUXAuthoringShell({
    profile = 'uiux-authoring',
    modeId = 'uiux',
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

    useKeyboardNudge({
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
                mode={modeId}
            />

            <div className='uiux-root' data-workspace='uiux'>
                {/* Primary authoring chrome */}
                <header className='uiux-top-chrome'>
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
                </header>

                {/* Secondary workspace strip */}
                <div className='uiux-workspace-strip'>
                    <div className='uiux-breadcrumb'>Design / UIUX</div>

                    <div className='uiux-surface-controls'>Draft</div>
                </div>

                {/* Main dock grid */}
                <div className='uiux-main-grid'>
                    <aside className='uiux-left-dock'>
                        <UIUXToolRail />
                    </aside>

                    <main className='uiux-canvas-dock'>
                        <UIUXCanvasStage profile={profile} workspaceId='uiux' />
                    </main>

                    <aside className='uiux-right-dock'>
                        <PanelRenderer
                            workspaceId='uiux'
                            node={node}
                            emit={emit}
                            extraPanels={[
                                {
                                    key: 'uiux-motion-runtime',
                                    component: TemplateMotionInspectorPanel,
                                    props: {
                                        nodeId: node?.id ?? null,
                                    },
                                },
                            ]}
                        />
                    </aside>
                </div>

                {/* Reserved bottom dock for design timeline */}
                <footer className='uiux-bottom-dock'>
                    <UIUXTransitionTimelinePanel node={node} />
                </footer>

                <WorkspaceSessionsRoot modeId={modeId} />
            </div>
        </>
    );
}
