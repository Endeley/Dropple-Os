import { EventTypes } from '@/core/events/eventTypes.js';
import { createTimelineCapability } from "./timelineCapability.js";

export const podcastWorkspace = {
    id: "podcast",
    label: "Podcast / Streaming",
    status: "active",

    engines: ["timeline", "audio"],
    tools: ["cut", "mute", "chapter"],
    panels: ["NodeHeaderPanel"],
    activeDomains: ["state", "motion"],
    enabledTriggerTypes: new Set(["manual"]),

    capabilities: {
        canvas: false,
        timeline: true,
        animation: false,
        sequencer: true,
        audio: true,
        video: false,
        codegen: false,
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
        allowedProperties: ["volume", "mute"],
    }),

    export: {
        formats: ["mp3", "wav"],
    },
};
