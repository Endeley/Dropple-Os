import { createTimelineCapability } from "./timelineCapability.js";
import { EventTypes } from '@/core/events/eventTypes.js';

/**
 * Animation Workspace
 *
 * This is the reference implementation for:
 * - timeline-heavy modes
 * - motion systems
 * - preview vs commit workflows
 */
export const animationWorkspace = {
    id: "animation",
    label: "Animation / Motion",
    status: "active",

    engines: ["nodeTree", "layout", "timeline"],
    tools: ["select", "move", "keyframe", "path"],
    panels: ["NodeHeaderPanel", "MotionPanel"],
    activeDomains: ["canvas", "state", "motion"],
    enabledTriggerTypes: new Set(["manual"]),

    capabilities: {
        canvas: true,
        timeline: true,
        animation: true,
        rigging: true,
        sequencer: true,
        stateMachines: true,
        audio: false,
        video: false,
        codegen: false,
    },

    timeline: createTimelineCapability({
        readOnly: false,
        allowedProperties: ["x", "y", "scale", "rotation", "opacity"],
    }),

    export: {
        formats: ["mp4", "gif", "lottie"],
    },

    allowedEventTypes: [
        EventTypes.TIMELINE_TRACK_CREATE,
        EventTypes.TIMELINE_TRACK_DELETE,
        EventTypes.TIMELINE_TRACK_REORDER,
        EventTypes.TIMELINE_TRACK_CHANNEL_ASSIGN,
        EventTypes.TIMELINE_TRACK_LOCK_TOGGLE,
        EventTypes.TIMELINE_TRACK_BLEND_MODE_SET,
        EventTypes.TIMELINE_GROUP_CREATE,
        EventTypes.TIMELINE_GROUP_DELETE,
        EventTypes.TIMELINE_GROUP_LOCK_TOGGLE,
        EventTypes.TIMELINE_GROUP_COLLAPSE_TOGGLE,
        EventTypes.TIMELINE_GROUP_TRACK_ASSIGN,
        EventTypes.TIMELINE_GROUP_TRACK_UNASSIGN,
        EventTypes.ANIMATION_TRACK_CREATE,
        EventTypes.ANIMATION_TRACK_DELETE,
        EventTypes.ANIMATION_KEYFRAME_ADD,
        EventTypes.ANIMATION_KEYFRAME_UPDATE,
        EventTypes.ANIMATION_KEYFRAME_DELETE,
        EventTypes.RIG_CREATE,
        EventTypes.RIG_UPDATE,
        EventTypes.RIG_DELETE,
        EventTypes.RIG_SET_ACTIVE,
        EventTypes.RIG_CONTROLLER_CREATE,
        EventTypes.RIG_CONTROLLER_UPDATE,
        EventTypes.RIG_CONTROLLER_DELETE,
        EventTypes.RIG_CONSTRAINT_CREATE,
        EventTypes.RIG_CONSTRAINT_UPDATE,
        EventTypes.RIG_CONSTRAINT_DELETE,
        EventTypes.SEQUENCE_CREATE,
        EventTypes.SEQUENCE_UPDATE,
        EventTypes.SEQUENCE_DELETE,
        EventTypes.SEQUENCE_SET_ACTIVE,
        EventTypes.SEQUENCE_TRACK_CREATE,
        EventTypes.SEQUENCE_TRACK_UPDATE,
        EventTypes.SEQUENCE_TRACK_DELETE,
        EventTypes.SEQUENCE_CLIP_CREATE,
        EventTypes.SEQUENCE_CLIP_UPDATE,
        EventTypes.SEQUENCE_CLIP_DELETE,
        EventTypes.STATE_MACHINE_CREATE,
        EventTypes.STATE_MACHINE_UPDATE,
        EventTypes.STATE_MACHINE_DELETE,
        EventTypes.STATE_MACHINE_SET_ACTIVE,
        EventTypes.STATE_MACHINE_PARAMETER_SET,
        EventTypes.STATE_MACHINE_TRANSITION,
    ],
};
