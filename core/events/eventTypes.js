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
    NODE_REPARENT: 'node/reparent',
    NODE_REORDER: 'node/reorder',
    NODE_WRAP: 'node/wrap',
    NODE_UNWRAP: 'node/unwrap',

    // Layout & transform
    NODE_MOVE: 'node/move',
    NODE_RESIZE: 'node/resize',
    NODE_ROTATE: 'node/rotate',
    ALIGN_NODES: 'align/nodes',
    DISTRIBUTE_NODES: 'distribute/nodes',
    LAYOUT_CONVERT: 'layout/convert',

    // Selection
    SELECTION_SET: 'SELECTION_SET',
    SELECTION_CLEAR: 'SELECTION_CLEAR',
    SELECTION_TOGGLE: 'SELECTION_TOGGLE',
    SELECTION_ADD: 'SELECTION_ADD',
    SELECTION_REMOVE: 'SELECTION_REMOVE',
    CLIPBOARD_SET: 'CLIPBOARD_SET',
    CLIPBOARD_CLEAR: 'CLIPBOARD_CLEAR',

    // ─────────────────────────────
    // State identity (Phase 1½)
    // ─────────────────────────────
    STATE_SET: 'state/set',

    // ─────────────────────────────
    // Behavior graph (Phase B1)
    // ─────────────────────────────
    BEHAVIOR_STATE_CREATE: 'behavior/state/create',
    BEHAVIOR_STATE_UPDATE: 'behavior/state/update',
    BEHAVIOR_STATE_DELETE: 'behavior/state/delete',

    BEHAVIOR_TRANSITION_CREATE: 'behavior/transition/create',
    BEHAVIOR_TRANSITION_DELETE: 'behavior/transition/delete',

    BEHAVIOR_TRIGGER_CREATE: 'behavior/trigger/create',
    BEHAVIOR_TRIGGER_DELETE: 'behavior/trigger/delete',

    BEHAVIOR_TRANSITION_DEFINE: 'behavior/transition/define',

    BEHAVIOR_TRIGGER_BIND: 'behavior/trigger/bind',
    BEHAVIOR_TRIGGER_UNBIND: 'behavior/trigger/unbind',

    BEHAVIOR_TRIGGER_FIRE: 'behavior/trigger_fire',

    BEHAVIOR_STATE_COMMIT: 'behavior/state/commit',

    // ─────────────────────────────
    // Component identity (Phase 1¾)
    // ─────────────────────────────
    COMPONENT_CREATE: 'component/create',
    COMPONENT_INSTANCE_CREATE: 'component/instance/create',
    COMPONENT_INSTANCE_DETACH: 'component/instance/detach',
    COMPONENT_INSTANCE_OVERRIDE_SET: 'component/instance/override/set',
    COMPONENT_SET_ACTIVE: 'component/set-active',

    // ─────────────────────────────
    // Timeline (keyframes, not animation tracks)
    // ─────────────────────────────
    TIMELINE_KEYFRAME_ADD: 'timeline/keyframe/add',
    TIMELINE_KEYFRAME_MOVE: 'timeline/keyframe/move',
    TIMELINE_EVENT_ADD: 'timeline/event/add',

    // ─────────────────────────────
    // Animation authoring (Phase 5)
    // Truth = timeline tracks + keyframes
    // ─────────────────────────────
    ANIMATION_TRACK_CREATE: 'animation/track/create',
    ANIMATION_TRACK_DELETE: 'animation/track/delete',

    ANIMATION_KEYFRAME_ADD: 'animation/keyframe/add',
    ANIMATION_KEYFRAME_CREATE: 'animation/keyframe/create',
    ANIMATION_KEYFRAME_UPDATE: 'animation/keyframe/update',
    ANIMATION_KEYFRAME_DELETE: 'animation/keyframe/delete',

    // Canonical motion document mutations
    MOTION_CLIP_CREATE: 'motion/clipCreate',
    MOTION_CLIP_UPDATE: 'motion/clipUpdate',
    MOTION_CLIP_DELETE: 'motion/clipDelete',
    MOTION_KEYFRAME_ADD: 'motion/keyframeAdd',
    MOTION_KEYFRAME_UPDATE: 'motion/keyframeUpdate',
    MOTION_KEYFRAME_DELETE: 'motion/keyframeDelete',

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

    // ─────────────────────────────
    // Workspace (projection state)
    // ─────────────────────────────
    WORKSPACE_SET_ACTIVE: 'workspace/set-active',
    WORKSPACE_SET_VIEWPORT: 'workspace/viewport/set',
    WORKSPACE_SET_CANVAS_SURFACE: 'workspace/canvas-surface/set',

    // ─────────────────────────────
    // Scene (runtime projection state)
    // ─────────────────────────────
    SHOT_SET_ACTIVE: 'scene/shot/set-active',

    // ─────────────────────────────
    // Clock (system time authority)
    // ─────────────────────────────
    CLOCK_SEEK: 'clock/seek',
    CLOCK_PLAY: 'clock/play',
    CLOCK_PAUSE: 'clock/pause',
});
