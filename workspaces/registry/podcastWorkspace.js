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
        audio: true,
        video: false,
        codegen: false,
    },

    allowedEventTypes: [],

    timeline: createTimelineCapability({
        readOnly: false,
        allowedProperties: ["volume", "mute"],
    }),

    export: {
        formats: ["mp3", "wav"],
    },
};
