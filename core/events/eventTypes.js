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
    // State identity
    // ─────────────────────────────
    STATE_SET: 'state/set',
    STATE_MACHINE_CREATE: 'state-machine/create',
    STATE_MACHINE_UPDATE: 'state-machine/update',
    STATE_MACHINE_DELETE: 'state-machine/delete',
    STATE_MACHINE_SET_ACTIVE: 'state-machine/set-active',
    STATE_MACHINE_PARAMETER_SET: 'state-machine/parameter/set',
    STATE_MACHINE_TRANSITION: 'state-machine/transition',

    NAVIGATION_NAVIGATE: 'navigation/navigate',

    VECTOR_CREATE: 'vector/create',
    VECTOR_UPDATE: 'vector/update',
    VECTOR_DELETE: 'vector/delete',

    // ─────────────────────────────
    // Collaboration
    // ─────────────────────────────
    COLLABORATION_SESSION_START: 'collaboration/session/start',
    COLLABORATION_SESSION_END: 'collaboration/session/end',
    COLLABORATION_SESSION_USER_JOIN: 'collaboration/session/user/join',
    COLLABORATION_SESSION_USER_LEAVE: 'collaboration/session/user/leave',
    COLLABORATION_PRESENCE_UPDATE: 'collaboration/presence/update',
    COLLABORATION_PRESENCE_REMOVE: 'collaboration/presence/remove',
    COLLABORATION_CURSOR_UPDATE: 'collaboration/cursor/update',
    COLLABORATION_CURSOR_REMOVE: 'collaboration/cursor/remove',

    // ─────────────────────────────
    // AI
    // ─────────────────────────────
    AI_REQUEST_ENQUEUE: 'ai/request/enqueue',
    AI_REQUEST_COMPLETE: 'ai/request/complete',
    AI_REQUEST_FAIL: 'ai/request/fail',

    // ─────────────────────────────
    // Behavior graph
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
    // Components
    // ─────────────────────────────
    COMPONENT_CREATE: 'component/create',
    COMPONENT_INSTANCE_CREATE: 'component/instance/create',
    COMPONENT_INSTANCE_DETACH: 'component/instance/detach',
    COMPONENT_INSTANCE_OVERRIDE_SET: 'component/instance/override/set',
    COMPONENT_SET_ACTIVE: 'component/set-active',

    // ─────────────────────────────
    // Timeline
    // ─────────────────────────────
    TIMELINE_TRACK_CREATE: 'timeline/track/create',
    TIMELINE_TRACK_DELETE: 'timeline/track/delete',
    TIMELINE_TRACK_REORDER: 'timeline/track/reorder',
    TIMELINE_TRACK_CHANNEL_ASSIGN: 'timeline/track/channel/assign',
    TIMELINE_TRACK_LOCK_TOGGLE: 'timeline/track/lock/toggle',
    TIMELINE_TRACK_BLEND_MODE_SET: 'timeline/track/blend-mode/set',
    TIMELINE_GROUP_CREATE: 'timeline/group/create',
    TIMELINE_GROUP_DELETE: 'timeline/group/delete',
    TIMELINE_GROUP_LOCK_TOGGLE: 'timeline/group/lock/toggle',
    TIMELINE_GROUP_COLLAPSE_TOGGLE: 'timeline/group/collapse/toggle',
    TIMELINE_GROUP_TRACK_ASSIGN: 'timeline/group/track/assign',
    TIMELINE_GROUP_TRACK_UNASSIGN: 'timeline/group/track/unassign',
    TIMELINE_KEYFRAME_ADD: 'timeline/keyframe/add',
    TIMELINE_KEYFRAME_MOVE: 'timeline/keyframe/move',
    TIMELINE_EVENT_ADD: 'timeline/event/add',

    // ─────────────────────────────
    // Scene shots
    // ─────────────────────────────
    SCENE_SHOT_TRACK_CREATE: 'scene/shot-track/create',
    SCENE_SHOT_TRACK_UPDATE: 'scene/shot-track/update',
    SCENE_SHOT_TRACK_DELETE: 'scene/shot-track/delete',
    SCENE_SHOT_CREATE: 'scene/shot/create',
    SCENE_SHOT_UPDATE: 'scene/shot/update',
    SCENE_SHOT_DELETE: 'scene/shot/delete',
    SCENE_SHOT_MOVE: 'scene/shot/move',

    // ─────────────────────────────
    // Sequences
    // ─────────────────────────────
    SEQUENCE_CREATE: 'sequence/create',
    SEQUENCE_UPDATE: 'sequence/update',
    SEQUENCE_DELETE: 'sequence/delete',
    SEQUENCE_SET_ACTIVE: 'sequence/set-active',
    SEQUENCE_TRACK_CREATE: 'sequence/track/create',
    SEQUENCE_TRACK_UPDATE: 'sequence/track/update',
    SEQUENCE_TRACK_DELETE: 'sequence/track/delete',
    SEQUENCE_CLIP_CREATE: 'sequence/clip/create',
    SEQUENCE_CLIP_UPDATE: 'sequence/clip/update',
    SEQUENCE_CLIP_DELETE: 'sequence/clip/delete',

    // ─────────────────────────────
    // Animation
    // ─────────────────────────────
    ANIMATION_TRACK_CREATE: 'animation/track/create',
    ANIMATION_TRACK_DELETE: 'animation/track/delete',
    ANIMATION_KEYFRAME_ADD: 'animation/keyframe/add',
    ANIMATION_KEYFRAME_CREATE: 'animation/keyframe/create',
    ANIMATION_KEYFRAME_UPDATE: 'animation/keyframe/update',
    ANIMATION_KEYFRAME_DELETE: 'animation/keyframe/delete',

    // Motion
    MOTION_CLIP_CREATE: 'motion/clipCreate',
    MOTION_CLIP_UPDATE: 'motion/clipUpdate',
    MOTION_CLIP_DELETE: 'motion/clipDelete',
    MOTION_KEYFRAME_ADD: 'motion/keyframeAdd',
    MOTION_KEYFRAME_UPDATE: 'motion/keyframeUpdate',
    MOTION_KEYFRAME_DELETE: 'motion/keyframeDelete',

    // Rigging
    RIG_CREATE: 'rig/create',
    RIG_UPDATE: 'rig/update',
    RIG_DELETE: 'rig/delete',
    RIG_SET_ACTIVE: 'rig/set-active',
    RIG_CONTROLLER_CREATE: 'rig/controller/create',
    RIG_CONTROLLER_UPDATE: 'rig/controller/update',
    RIG_CONTROLLER_DELETE: 'rig/controller/delete',
    RIG_CONSTRAINT_CREATE: 'rig/constraint/create',
    RIG_CONSTRAINT_UPDATE: 'rig/constraint/update',
    RIG_CONSTRAINT_DELETE: 'rig/constraint/delete',

    // Graph
    GRAPH_NODE_ADD: 'graph/node/add',
    GRAPH_UPDATE: 'graph/update',
    GRAPH_NODE_UPDATE: 'graph/node/update',
    GRAPH_NODE_DELETE: 'graph/node/delete',
    GRAPH_CONNECT: 'graph/connect',
    GRAPH_DISCONNECT: 'graph/disconnect',
    GRAPH_OUTPUT_SET: 'graph/output/set',
    GRAPH_PARAMETER_UPDATE: 'graph/parameter/update',

    // ─────────────────────────────
    // Workspace
    // ─────────────────────────────
    WORKSPACE_SET_ACTIVE: 'workspace/set-active',
    WORKSPACE_SET_VIEWPORT: 'workspace/viewport/set',
    WORKSPACE_SET_CANVAS_SURFACE: 'workspace/canvas-surface/set',
    TOOLS_REGISTER: 'tools/register',
    TOOLS_UNREGISTER: 'tools/unregister',
    TOOL_SET_ACTIVE: 'tools/set-active',
    DRAG_START: 'interaction/drag/start',
    DRAG_UPDATE: 'interaction/drag/update',
    DRAG_END: 'interaction/drag/end',

    // ─────────────────────────────
    // Clock
    // ─────────────────────────────
    CLOCK_SEEK: 'clock/seek',
    CLOCK_PLAY: 'clock/play',
    CLOCK_PAUSE: 'clock/pause',
});
