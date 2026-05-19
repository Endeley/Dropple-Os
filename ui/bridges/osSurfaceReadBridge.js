import {
    buildEnvironmentSurfaceModelFromProjection,
    buildSynthesizedToolSurfaceModelFromProjection,
    buildWorkspaceShellSurfaceModel,
} from '@/runtime/osSurface/index.js';

export function readOsSurfaceSnapshot() {
    return Object.freeze({
        environment: buildEnvironmentSurfaceModelFromProjection(),
        synthesizedTools: buildSynthesizedToolSurfaceModelFromProjection(),
    });
}

export function readOsWorkspaceShellSurfaceModel() {
    return buildWorkspaceShellSurfaceModel(readOsSurfaceSnapshot());
}
