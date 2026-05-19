import {
    buildEnvironmentSurfaceModelFromProjection,
    buildSynthesizedToolSurfaceModelFromProjection,
} from '@/runtime/osSurface/index.js';

export function readOsSurfaceSnapshot() {
    return Object.freeze({
        environment: buildEnvironmentSurfaceModelFromProjection(),
        synthesizedTools: buildSynthesizedToolSurfaceModelFromProjection(),
    });
}
