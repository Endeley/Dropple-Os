// runtime/projection/v1/workspaceProjection.js

import {
    getWorkspaceState as __getWorkspaceStateInternal,
    getActiveWorkspace as __getActiveWorkspaceInternal,
} from '../../state/workspaceState.js';

export function getWorkspaceProjection() {
    const ws = __getWorkspaceStateInternal();
    if (!ws) return null;

    return {
        id: ws.id,
        viewport: ws.viewport,
        canvasSurface: ws.canvasSurface,
    };
}

export function getActiveWorkspace() {
    return __getActiveWorkspaceInternal();
}
