// core/events/eventTypes.js

export const EventTypes = Object.freeze({
    // Node lifecycle
    NODE_CREATE: 'node/create',
    NODE_UPDATE: 'node/update',
    NODE_DELETE: 'node/delete',

    // Tree structure
    NODE_ATTACH: 'node/attach',
    NODE_DETACH: 'node/detach',

    // Layout & transform
    NODE_MOVE: 'node/move',
    NODE_RESIZE: 'node/resize',
    NODE_REORDER: 'node/reorder',

    // Selection (stateful but deterministic)
    SELECTION_SET: 'selection/set',

    // State identity (Phase 1½)
    STATE_SET: 'state/set',

    // Component identity (Phase 1¾)
    COMPONENT_SET_ACTIVE: 'component/set-active',

    // Timeline
    TIMELINE_KEYFRAME_ADD: 'timeline/keyframe/add',
    TIMELINE_KEYFRAME_MOVE: 'timeline/keyframe/move',

    // Animation - Clip lifecycle
    ANIMATION_CLIP_CREATE: 'animation/clip/create',
    ANIMATION_CLIP_UPDATE: 'animation/clip/update',
    ANIMATION_CLIP_DELETE: 'animation/clip/delete',

    // Animation - Track lifecycle
    ANIMATION_TRACK_CREATE: 'animation/track/create',
    ANIMATION_TRACK_DELETE: 'animation/track/delete',

    // Animation - Keyframe lifecycle
    ANIMATION_KEYFRAME_CREATE: 'animation/keyframe/create',
    ANIMATION_KEYFRAME_UPDATE: 'animation/keyframe/update',
    ANIMATION_KEYFRAME_DELETE: 'animation/keyframe/delete',

    // Transitions
    TRANSITION_CREATE: 'transition/create',
    TRANSITION_UPDATE: 'transition/update',
    TRANSITION_DELETE: 'transition/delete',

    // Interactions (Phase 3)
    INTERACTION_CREATE: 'interaction/create',
    INTERACTION_UPDATE: 'interaction/update',
    INTERACTION_DELETE: 'interaction/delete',
});
