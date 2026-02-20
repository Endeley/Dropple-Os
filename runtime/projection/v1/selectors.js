// runtime/projection/v1/selectors.js

import { getRuntimeSnapshot } from './runtimeSnapshot.js';
import { getWorkspaceProjection } from './workspaceProjection.js';

export function selectViewport() {
    return getWorkspaceProjection()?.viewport ?? null;
}

export function selectCanvasSurface() {
    return getWorkspaceProjection()?.canvasSurface ?? null;
}

export function selectNodes() {
    return getRuntimeSnapshot()?.nodes ?? {};
}

export function selectRootIds() {
    return getRuntimeSnapshot()?.rootIds ?? [];
}

export function selectTimeline() {
    return getRuntimeSnapshot()?.timeline ?? null;
}

export function selectIsReplaying() {
    return getRuntimeSnapshot()?.isReplaying ?? false;
}

export function selectRenderState() {
    return getRuntimeSnapshot();
}
