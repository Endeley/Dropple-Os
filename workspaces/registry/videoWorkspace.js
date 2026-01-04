export const videoWorkspace = {
    id: "video",
    label: "Video Editor",
    status: "active",

    engines: ["timeline", "media", "constraints"],

    ir: {
        design: false,
        layout: false,
        interaction: false,
        state: false,
        motion: true,
        audio: true,
        video: true,
        semantic: false,
        code: false,
    },

    timeline: {
        enabled: true,
        primary: true,
        tracks: ["video", "audio", "overlay"],
    },

    nodes: ["video", "audio", "text", "image"],

    tools: ["cut", "trim", "transition", "caption"],
    panels: ["timeline", "media", "properties"],

    export: {
        formats: ["mp4", "mov", "webm"],
    },
};
