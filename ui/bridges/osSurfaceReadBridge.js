import {
    buildAssistantSurfaceModelFromProjection,
    buildEnvironmentSurfaceModelFromProjection,
    buildSynthesizedToolSurfaceModelFromProjection,
    buildWorkspaceShellSurfaceModel,
} from '@/runtime/osSurface/index.js';

export function readOsSurfaceSnapshot() {
    return Object.freeze({
        environment: buildEnvironmentSurfaceModelFromProjection(),
        assistants: buildAssistantSurfaceModelFromProjection(),
        synthesizedTools: buildSynthesizedToolSurfaceModelFromProjection(),
    });
}

export function readOsWorkspaceShellSurfaceModel() {
    return buildWorkspaceShellSurfaceModel(readOsSurfaceSnapshot());
}
