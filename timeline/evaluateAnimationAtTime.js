// ⚠️ Animation v1 contract
// This file is part of the locked Animation v1 system.
// Do not extend with bones / IK / deformation.
// See docs/ANIMATION_V1.md

import { evaluateTimeline } from './evaluateTimeline.js';

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
export function evaluateAnimationAtTime(args, timeMs, baseState) {
    // Legacy wrapper for Animation V1. Prefer `evaluateTimeline` instead.
    if (timeMs !== undefined || baseState !== undefined) {
        return evaluateTimeline({
            animations: args,
            timeMs,
            baseState,
        });
    }
    return evaluateTimeline(args);
}
