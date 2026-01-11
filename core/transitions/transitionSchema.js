// core/transitions/transitionSchema.js

/**
 * Properties that may be transitioned between states.
 * This list is intentionally strict and finite.
 */
export const TransitionProperties = Object.freeze([
    'x',
    'y',
    'opacity',
    'scale',
    'rotation',
    'width',
    'height',
]);

/**
 * Allowed transition scopes.
 * Transitions never cross scopes.
 */
export const TransitionScopes = Object.freeze(['component', 'page']);

/**
 * Deterministic easing presets.
 * No custom curves allowed in Phase 2.
 */
export const TransitionEasings = Object.freeze(['linear', 'ease-in', 'ease-out', 'ease-in-out']);

/**
 * @typedef {"x"|"y"|"opacity"|"scale"|"rotation"|"width"|"height"} TransitionProperty
 */

/**
 * @typedef {Object} TransitionDefinition
 * @property {string} id
 * @property {"component"|"page"} scope
 * @property {string} sourceStateId
 * @property {string} targetStateId
 * @property {TransitionProperty[]} properties
 * @property {number} durationMs
 * @property {"linear"|"ease-in"|"ease-out"|"ease-in-out"} easing
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * Declarative description of how state changes feel.
 *
 * Transitions do NOT:
 * - trigger state changes
 * - own timelines
 * - contain keyframes
 * - execute animation
 */
export function createTransitionDefinition({
    id,
    scope,
    sourceStateId,
    targetStateId,
    properties,
    durationMs,
    easing,
    createdAt,
    updatedAt,
}) {
    return {
        id,
        scope,
        sourceStateId,
        targetStateId,
        properties,
        durationMs,
        easing,
        createdAt,
        updatedAt,
    };
}

/**
 * Validate a transition payload without side effects.
 * Returns true only for deterministic, schema-safe transitions.
 *
 * @param {TransitionDefinition} transition
 */
export function isValidTransition(transition) {
    if (!transition) return false;
    if (!transition.id || typeof transition.id !== 'string') return false;
    if (!TransitionScopes.includes(transition.scope)) return false;
    if (!transition.sourceStateId || !transition.targetStateId) return false;
    if (!Array.isArray(transition.properties) || transition.properties.length === 0) return false;
    if (!transition.properties.every((prop) => TransitionProperties.includes(prop))) return false;
    if (!Number.isFinite(transition.durationMs) || transition.durationMs <= 0) return false;
    if (!TransitionEasings.includes(transition.easing)) return false;
    if (!Number.isFinite(transition.createdAt) || !Number.isFinite(transition.updatedAt)) return false;
    return true;
}
