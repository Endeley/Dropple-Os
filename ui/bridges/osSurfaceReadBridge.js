import {
    buildAssistantSurfaceModelFromProjection,
    buildEnvironmentSurfaceModelFromProjection,
    buildSynthesizedToolSurfaceModelFromProjection,
    buildWorkspaceShellSurfaceModel,
} from '@/runtime/osSurface/index.js';

export function readOsSurfaceSnapshot({ perspectiveId = null, entryId = null } = {}) {
    return Object.freeze({
        environment: buildEnvironmentSurfaceModelFromProjection(),
        assistants: buildAssistantSurfaceModelFromProjection(null, {
            perspectiveId,
            entryId,
        }),
        synthesizedTools: buildSynthesizedToolSurfaceModelFromProjection(),
    });
}

export function readOsWorkspaceShellSurfaceModel() {
    return buildWorkspaceShellSurfaceModel(readOsSurfaceSnapshot());
}
