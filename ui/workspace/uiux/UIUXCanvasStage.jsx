'use client';

import { WorkspaceCanvasRoot } from '@/ui/workspace/WorkspaceCanvasRoot.jsx';
import { UIUXEmptyWorldOverlay } from './UIUXEmptyWorldOverlay.jsx';

export function UIUXCanvasStage({ profile = 'ux-validation', workspaceId = 'uiux' }) {
    return (
        <main
            className='uiux-canvas-stage'
            data-testid='uiux-canvas-stage'
            data-pointer-surface='authoring'
            data-pointer-mode='node-authoring'>
            <WorkspaceCanvasRoot
                workspaceId={workspaceId}
                profile={profile}
                projectionSlots={{
                    emptyWorld: ({ workspaceId: activeWorkspaceId, modeId, nodeCount, worldHistory }) => (
                        <UIUXEmptyWorldOverlay
                            workspaceId={activeWorkspaceId}
                            modeId={modeId}
                            nodeCount={nodeCount}
                            worldHistory={worldHistory}
                        />
                    ),
                }}
            />
        </main>
    );
}
