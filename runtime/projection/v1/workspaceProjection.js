// runtime/projection/v1/workspaceProjection.js

/**
 * @deprecated Legacy workspace projection getter.
 *
 * New UI reads should prefer `useWorkspaceViewState`, which reads from the
 * canonical projected Zustand mirror instead of recomputing from internals.
 */

import { __getRuntimeStateInternal } from '../../state/runtimeState.internal.js';
import { createDefaultWorkspaceState } from '../../state/workspaceRuntime.js';

export function getWorkspaceProjection(runtimeState = null) {
    const state = runtimeState ?? __getRuntimeStateInternal();
    const ws = state?.workspace ?? createDefaultWorkspaceState();

    return {
        id: ws.id,
        viewport: ws.viewport,
        canvasSurface: ws.canvasSurface,
        canvasPolicy: ws.canvasPolicy,
        policy: ws.policy,
        ui: ws.ui,
        timeline: ws.timeline,
        profile: ws.profile,
        enabledTriggerTypes: ws.enabledTriggerTypes,
        allowedEventTypes: ws.allowedEventTypes,
    };
}
