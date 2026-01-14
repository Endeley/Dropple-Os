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
    panels: ["layers", "timeline", "properties"],

    capabilities: {
        canvas: true,
        timeline: true,
        animation: true,
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

    allowedEventTypes: new Set([
        EventTypes.ANIMATION_TRACK_CREATE,
        EventTypes.ANIMATION_TRACK_DELETE,
        EventTypes.ANIMATION_KEYFRAME_ADD,
        EventTypes.ANIMATION_KEYFRAME_UPDATE,
        EventTypes.ANIMATION_KEYFRAME_DELETE,
    ]),
};
