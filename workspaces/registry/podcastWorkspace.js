export const podcastWorkspace = {
    id: "podcast",
    label: "Podcast / Audio",
    status: "active",

    engines: ["timeline", "audio"],

    ir: {
        design: false,
        layout: false,
        interaction: false,
        state: false,
        motion: true,
        audio: true,
        video: false,
        semantic: true,
        code: false,
    },

    timeline: {
        enabled: true,
        primary: true,
        tracks: ["audio", "markers"],
    },

    nodes: ["audio", "segment", "marker"],

    tools: ["cut", "split", "noise-reduce"],
    panels: ["timeline", "chapters", "properties"],

    export: {
        formats: ["mp3", "wav", "aac"],
    },
};
