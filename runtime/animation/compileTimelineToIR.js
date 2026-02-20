import { createAnimationIR } from './animationIR.js';

/**
 * Compiles a timeline object into Animation IR array.
 * Pure: no rendering, no side effects.
 */
export function compileTimelineToIR(timeline) {
    if (!timeline || !timeline.animations) return [];

    return timeline.animations.map((anim) =>
        createAnimationIR({
            target: anim.target,
            property: anim.property,
            keyframes: anim.keyframes,
        })
    );
}
