'use client';

import { useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

let lastWorkspaceViewState = null;

export function selectWorkspaceViewState(state) {
    const workspace = state?.workspace ?? null;

    const nextWorkspaceViewState = {
        id: workspace?.id ?? null,
        modeId: workspace?.modeId ?? workspace?.legacy?.modeId ?? null,
        definitionId: workspace?.definitionId ?? workspace?.legacy?.definitionId ?? null,
        viewport: workspace?.viewport ?? null,
        canvasSurface: workspace?.canvasSurface ?? null,
        canvasPolicy: workspace?.canvasPolicy ?? null,
        policy: workspace?.policy ?? null,
        ui: workspace?.ui ?? null,
        timeline: workspace?.timeline ?? null,
        profile: workspace?.profile ?? null,
        enabledTriggerTypes: workspace?.enabledTriggerTypes ?? null,
        allowedEventTypes: workspace?.allowedEventTypes ?? null,
    };

    if (
        lastWorkspaceViewState &&
        lastWorkspaceViewState.id === nextWorkspaceViewState.id &&
        lastWorkspaceViewState.modeId === nextWorkspaceViewState.modeId &&
        lastWorkspaceViewState.definitionId === nextWorkspaceViewState.definitionId &&
        lastWorkspaceViewState.viewport === nextWorkspaceViewState.viewport &&
        lastWorkspaceViewState.canvasSurface === nextWorkspaceViewState.canvasSurface &&
        lastWorkspaceViewState.canvasPolicy === nextWorkspaceViewState.canvasPolicy &&
        lastWorkspaceViewState.policy === nextWorkspaceViewState.policy &&
        lastWorkspaceViewState.ui === nextWorkspaceViewState.ui &&
        lastWorkspaceViewState.timeline === nextWorkspaceViewState.timeline &&
        lastWorkspaceViewState.profile === nextWorkspaceViewState.profile &&
        lastWorkspaceViewState.enabledTriggerTypes === nextWorkspaceViewState.enabledTriggerTypes &&
        lastWorkspaceViewState.allowedEventTypes === nextWorkspaceViewState.allowedEventTypes
    ) {
        return lastWorkspaceViewState;
    }

    lastWorkspaceViewState = nextWorkspaceViewState;
    return nextWorkspaceViewState;
}

/**
 * Canonical React hook for workspace-level projected reads.
 * Reads from the projected Zustand mirror only.
 */
export function useWorkspaceViewState(selector = (state) => state) {
    const workspaceViewState = useRuntimeStore(selectWorkspaceViewState);
    return useMemo(() => selector(workspaceViewState), [workspaceViewState, selector]);
}
