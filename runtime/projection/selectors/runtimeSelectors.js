import {
    getProjectedRuntimeViewState,
    getProjectedWorkspaceViewState,
} from '../nonReactProjection.js';

export function selectViewport() {
    return getProjectedWorkspaceViewState()?.viewport ?? null;
}

export function selectCanvasSurface() {
    return getProjectedWorkspaceViewState()?.canvasSurface ?? null;
}

export function selectNodes() {
    return getProjectedRuntimeViewState()?.nodes ?? {};
}

export function selectRootIds() {
    return getProjectedRuntimeViewState()?.rootIds ?? [];
}

export function selectTimeline() {
    return getProjectedRuntimeViewState()?.timeline ?? null;
}

export function selectIsReplaying() {
    return getProjectedRuntimeViewState()?.isReplaying ?? false;
}

export function selectRenderState() {
    return getProjectedRuntimeViewState();
}

export function selectSequencerPreview() {
    return getProjectedRuntimeViewState()?.sequencer ?? null;
}
