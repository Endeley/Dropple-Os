import { createAnimationIR } from '@/engine/animation/animationIR.js';

/**
 * Compiles a timeline object into Animation IR array.
 * Pure: no rendering, no side effects.
 */
export function compileTimelineToIR(motion) {
    const clips = motion?.clips ? Object.values(motion.clips) : [];
    if (!clips.length) return [];

    return clips.map((clip) =>
        createAnimationIR({
            target: clip.target,
            property: clip.property,
            keyframes: (clip.keyframes || []).map((keyframe) => ({
                time: keyframe.t,
                value: keyframe.v,
                easing: keyframe.easing,
            })),
        })
    );
}
