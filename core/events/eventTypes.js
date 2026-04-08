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
    // State identity (Phase 1½)
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
    COLLABORATION_SESSION_START: 'collaboration/session/start',
    COLLABORATION_SESSION_END: 'collaboration/session/end',
    COLLABORATION_SESSION_USER_JOIN: 'collaboration/session/user/join',
    COLLABORATION_SESSION_USER_LEAVE: 'collaboration/session/user/leave',
    COLLABORATION_PRESENCE_UPDATE: 'collaboration/presence/update',
    COLLABORATION_PRESENCE_REMOVE: 'collaboration/presence/remove',
    COLLABORATION_CURSOR_UPDATE: 'collaboration/cursor/update',
    COLLABORATION_CURSOR_REMOVE: 'collaboration/cursor/remove',
    AI_REQUEST_ENQUEUE: 'ai/request/enqueue',
    AI_REQUEST_COMPLETE: 'ai/request/complete',
    AI_REQUEST_FAIL: 'ai/request/fail',

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

    // Graph authoring
    GRAPH_NODE_ADD: 'graph/node/add',
    GRAPH_UPDATE: 'graph/update',
    GRAPH_NODE_UPDATE: 'graph/node/update',
    GRAPH_NODE_DELETE: 'graph/node/delete',
    GRAPH_NODE_SELECT: 'graph/node/select',
    GRAPH_NODE_TOGGLE: 'graph/node/toggle',
    GRAPH_NODE_CLEAR: 'graph/node/clear',
    GRAPH_DRAG_START: 'graph/drag/start',
    GRAPH_DRAG_UPDATE: 'graph/drag/update',
    GRAPH_DRAG_END: 'graph/drag/end',
    GRAPH_PAN_START: 'graph/pan/start',
    GRAPH_PAN_UPDATE: 'graph/pan/update',
    GRAPH_PAN_END: 'graph/pan/end',
    GRAPH_VIEWPORT_ZOOM: 'graph/viewport/zoom',
    GRAPH_CONNECTION_START: 'graph/connection/start',
    GRAPH_CONNECTION_UPDATE: 'graph/connection/update',
    GRAPH_CONNECTION_END: 'graph/connection/end',
    GRAPH_CONNECT: 'graph/connect',
    GRAPH_DISCONNECT: 'graph/disconnect',
    GRAPH_OUTPUT_SET: 'graph/output/set',
    GRAPH_PARAMETER_UPDATE: 'graph/parameter/update',

    // Sequencer
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
    TOOLS_REGISTER: 'tools/register',
    TOOLS_UNREGISTER: 'tools/unregister',
    TOOL_SET_ACTIVE: 'tools/set-active',
    INPUT_CREATE_COMMIT: 'input/create-commit',
    DRAG_START: 'interaction/drag/start',
    DRAG_UPDATE: 'interaction/drag/update',
    DRAG_END: 'interaction/drag/end',

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
