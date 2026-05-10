import { createMotionExportManifest } from './createMotionExportManifest.js';
import { executeMotionExport } from './executeMotionExport.js';

export function createMotionExportCommand({
    state,
    format = 'web-animation',
} = {}) {
    if (!state || typeof state !== 'object') {
        throw new Error('createMotionExportCommand requires state.');
    }

    return Object.freeze({
        manifest: createMotionExportManifest({
            state,
            format,
        }),
    });
}

export function performMotionExportCommand({
    state,
    format = 'web-animation',
} = {}) {
    return executeMotionExport({
        state,
        format,
    });
}
