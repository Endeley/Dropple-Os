'use client';

import CanvasRoot from '@/ui/canvas/CanvasRoot.jsx';

export function WorkspaceCanvasRoot({ workspaceId = null }) {
    return <CanvasRoot workspaceId={workspaceId} />;
}
