// core/events/eventTypes.js

export const EventTypes = Object.freeze({
    // ─────────────────────────────
    // Node lifecycle
    // ─────────────────────────────
    NODE_CREATE: 'node/create',
    NODE_UPDATE: 'node/update',
    NODE_DELETE: 'node/delete',

    // Tree structure
    NODE_ATTACH: 'node/attach',
    NODE_DETACH: 'node/detach',
    NODE_REORDER: 'node/reorder',

    // Layout & transform
    NODE_MOVE: 'node/move',
    NODE_RESIZE: 'node/resize',

    // Selection
    SELECTION_SET: 'selection/set',

    // ─────────────────────────────
    // State identity (Phase 1½)
    // ─────────────────────────────
    STATE_SET: 'state/set',

    // ─────────────────────────────
    // Component identity (Phase 1¾)
    // ─────────────────────────────
    COMPONENT_SET_ACTIVE: 'component/set-active',

    // ─────────────────────────────
    // Timeline (keyframes, not animation tracks)
    // ─────────────────────────────
    TIMELINE_KEYFRAME_ADD: 'timeline/keyframe/add',
    TIMELINE_KEYFRAME_MOVE: 'timeline/keyframe/move',

    // ─────────────────────────────
    // Animation authoring (Phase 5)
    // Truth = timeline tracks + keyframes
    // ─────────────────────────────
    ANIMATION_TRACK_CREATE: 'animation/track/create',
    ANIMATION_TRACK_DELETE: 'animation/track/delete',

    ANIMATION_KEYFRAME_ADD: 'animation/keyframe/add',
    ANIMATION_KEYFRAME_UPDATE: 'animation/keyframe/update',
    ANIMATION_KEYFRAME_DELETE: 'animation/keyframe/delete',

    // ─────────────────────────────
    // Transitions (between states)
    // ─────────────────────────────
    TRANSITION_CREATE: 'transition/create',
    TRANSITION_UPDATE: 'transition/update',
    TRANSITION_DELETE: 'transition/delete',

    // ─────────────────────────────
    // Interactions (Phase 3)
    // ─────────────────────────────
    INTERACTION_CREATE: 'interaction/create',
    INTERACTION_UPDATE: 'interaction/update',
    INTERACTION_DELETE: 'interaction/delete',
});
