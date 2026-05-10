import { compileTimelineToIR } from '@/runtime/animation/compileTimelineToIR.js';
import { exportWebAnimation } from '@/runtime/animation/exporters/exportWebAnimation.js';
import { exportCSSKeyframes } from '../animation/css/exportCSSKeyframes.js';
import { exportWAAPI } from '../animation/waapi/exportWAAPI.js';
import {
    createMotionExportManifest,
    materializeCanonicalMotion,
} from './createMotionExportManifest.js';

function exportWebAnimations(motion) {
    if (!motion) return [];

    const ir = compileTimelineToIR(motion);
    return ir.map((anim) => exportWebAnimation(anim, { duration: undefined }));
}

function executeMotionFormat({ motion, format }) {
    switch (format) {
        case 'web-animation':
            return exportWebAnimations(motion);
        case 'css':
            return exportCSSKeyframes({ motion });
        case 'waapi':
            return exportWAAPI({ motion });
        default:
            throw new Error(`Unsupported motion export format: ${format}`);
    }
}

export function executeMotionExport({
    state,
    format = 'web-animation',
} = {}) {
    if (!state || typeof state !== 'object') {
        throw new Error('executeMotionExport requires state.');
    }

    const manifest = createMotionExportManifest({
        state,
        format,
    });
    const motion = materializeCanonicalMotion(manifest.motion);
    const output = executeMotionFormat({
        motion,
        format,
    });

    return Object.freeze({
        manifest,
        output,
    });
}
