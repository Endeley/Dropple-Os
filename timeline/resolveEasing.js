import { EASINGS } from './easingRegistry.js';
import { MOTION_PRESETS } from './motionPresets.js';
import { EASING_PRESETS } from './easing/easingPresets.js';

/**
 * Resolves an easing name or preset to a runtime function.
 * Springs currently fall back to easeOut for determinism.
 */
export function resolveEasing(nameOrPreset) {
    const resolvedName = typeof nameOrPreset === 'string' ? MOTION_PRESETS[nameOrPreset] || nameOrPreset : null;
    const preset =
        typeof nameOrPreset === 'object' && nameOrPreset !== null
            ? nameOrPreset
            : EASING_PRESETS[resolvedName] || null;

    if (preset) {
        if (preset.type === 'cubic') {
            return cubicBezier(preset.x1, preset.y1, preset.x2, preset.y2);
        }
        if (preset.type === 'spring') {
            return EASINGS.easeOut;
        }
    }

    return EASINGS[resolvedName || nameOrPreset] || EASINGS.linear;
}

// Minimal cubic-bezier sampler (deterministic).
function cubicBezier(x1, y1, x2, y2) {
    return function (t) {
        let x = t;
        for (let i = 0; i < 5; i++) {
            const f = cubic(x, x1, x2) - t;
            const df = derivative(x, x1, x2);
            if (Math.abs(df) < 1e-6) break;
            x -= f / df;
        }
        const y = cubic(x, y1, y2);
        if (Number.isNaN(y)) return t;
        return clamp01(y);
    };
}

function cubic(t, a1, a2) {
    const c = 3 * a1;
    const b = 3 * (a2 - a1) - c;
    const a = 1 - c - b;
    return ((a * t + b) * t + c) * t;
}

function derivative(t, a1, a2) {
    const c = 3 * a1;
    const b = 3 * (a2 - a1) - c;
    const a = 1 - c - b;
    return (3 * a * t + 2 * b) * t + c;
}

function clamp01(v) {
    return Math.max(0, Math.min(1, v));
}
