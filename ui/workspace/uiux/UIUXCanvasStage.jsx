'use client';

import { useMemo } from 'react';
import { WorkspaceCanvasRoot } from '@/ui/workspace/WorkspaceCanvasRoot.jsx';
import { buildUIUXProjectionSlots } from './uiuxProjectionSlots.js';
import { resolveUIUXDefaultCreateParentId } from './uiuxProjectEmergenceProjection.js';

export function UIUXCanvasStage({
    profile = 'ux-validation',
    workspaceId = 'uiux',
    dismissedFirstExpressionNodeId = null,
    onDismissFirstExpression = null,
    immersiveFirstExpression = false,
}) {
    const projectionSlots = useMemo(() => buildUIUXProjectionSlots(), []);

    return (
        <main
            className='uiux-canvas-stage'
            data-testid='uiux-canvas-stage'
            data-pointer-surface='authoring'
            data-pointer-mode='node-authoring'>
            <WorkspaceCanvasRoot
                workspaceId={workspaceId}
                profile={profile}
                projectionSlots={projectionSlots}
                resolveDefaultCreateParentId={resolveUIUXDefaultCreateParentId}
                dismissedFirstExpressionNodeId={dismissedFirstExpressionNodeId}
                onDismissFirstExpression={onDismissFirstExpression}
                immersiveFirstExpression={immersiveFirstExpression}
            />
        </main>
    );
}
