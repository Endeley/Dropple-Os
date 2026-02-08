// ⚠️ Animation v1 contract
// This file is part of the locked Animation v1 system.
// Do not extend with bones / IK / deformation.
// See docs/ANIMATION_V1.md

import { evaluateAnimationTimeline } from './evaluateAnimationTimeline.js';

/**
 * Canonical animation evaluation entry point.
 *
 * This is the ONLY supported animation evaluation function.
 * Other evaluators are legacy or internal-only for now.
 * New animation code must call this function.
 *
 * Pure, deterministic, and side-effect free.
 *
 * @param {Object} timelineOrAnimations - Either { animations } or the animations object itself.
 * @param {number} timeMs
 * @param {Object=} baseState - Optional runtime/design state to merge onto.
 * @returns {Object} Projection or merged state (when baseState is provided).
 */
export function evaluateAnimationAtTime(timelineOrAnimations, timeMs, baseState) {
    const animations = timelineOrAnimations?.animations || timelineOrAnimations;
    const projection = evaluateAnimationTimeline({ animations, timeMs });

    if (!baseState) return projection;

    return {
        ...baseState,
        nodes: {
            ...(baseState.nodes || {}),
            ...(projection.nodes || {}),
        },
    };
}
