/**
 * Canonical Animation Contract (v0)
 *
 * This file defines the single supported animation data shape and time unit.
 * It is intentionally minimal and compatible with existing animation data.
 *
 * Time unit: milliseconds.
 */

/**
 * @typedef {Object} AnimationKeyframe
 * @property {string} id
 * @property {number} timeMs
 * @property {number} value
 * @property {string=} easing
 */

/**
 * @typedef {Object} AnimationTrack
 * @property {string} id
 * @property {string} nodeId
 * @property {string} property
 * @property {string[]} keyframeIds
 */

/**
 * @typedef {Object} AnimationClip
 * @property {string} id
 * @property {number=} durationMs
 * @property {string[]} trackIds
 */

/**
 * @typedef {Object} AnimationTimeline
 * @property {Object<string, AnimationClip>} clips
 * @property {Object<string, AnimationTrack>} tracks
 * @property {Object<string, AnimationKeyframe>} keyframes
 */

/**
 * @typedef {Object} AnimationContainer
 * @property {AnimationTimeline} animations
 */

// NOTE: This module is contract-only (no runtime logic).
