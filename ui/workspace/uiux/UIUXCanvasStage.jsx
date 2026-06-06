'use client';

import { WorkspaceCanvasRoot } from '@/ui/workspace/WorkspaceCanvasRoot.jsx';

export function UIUXCanvasStage({ profile = 'ux-validation', workspaceId = 'uiux' }) {
    return (
        <main className='uiux-canvas-stage' data-testid='uiux-canvas-stage'>
            <WorkspaceCanvasRoot workspaceId={workspaceId} profile={profile} />
        </main>
    );
}
