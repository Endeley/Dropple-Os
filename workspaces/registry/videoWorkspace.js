import { EventTypes } from '@/core/events/eventTypes.js';
import { createTimelineCapability } from "./timelineCapability.js";

export const videoWorkspace = {
    id: "video",
    label: "Video Editor",
    status: "active",

    engines: ["timeline", "media"],
    tools: ["cut", "trim", "overlay", "text"],
    panels: ["NodeHeaderPanel", "MotionPanel"],
    activeDomains: ["canvas", "state", "motion"],
    enabledTriggerTypes: ["time"],

    capabilities: {
        canvas: false,
        timeline: true,
        animation: false,
        sequencer: true,
        audio: true,
        video: true,
        codegen: false,
    },

    allowedEventTypes: [
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
    ],

    timeline: createTimelineCapability({
        readOnly: false,
        allowedProperties: ["x", "y", "opacity", "volume"],
    }),

    export: {
        formats: ["mp4"],
    },
};
