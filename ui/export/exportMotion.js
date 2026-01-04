import { compileTimelineToIR } from '@/engine/animation/compileTimelineToIR.js';
import { exportWebAnimation } from '@/engine/animation/exporters/exportWebAnimation.js';

/**
 * Exports motion intent from a timeline into Web Animations configs.
 * Pure function: returns array of { target, keyframes, options }.
 */
export function exportMotion({ timeline }) {
    if (!timeline) return [];
    const ir = compileTimelineToIR(timeline);
    return ir.map((anim) => exportWebAnimation(anim, { duration: timeline.duration }));
}
