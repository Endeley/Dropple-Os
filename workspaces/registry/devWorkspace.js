export const devWorkspace = {
    id: "dev",
    label: "Dev Mode",
    status: "active",

    engines: ["ir", "export"],

    ir: {
        design: true,
        layout: true,
        interaction: true,
        state: true,
        motion: true,
        audio: false,
        video: false,
        semantic: true,
        code: true,
    },

    timeline: {
        enabled: false,
        primary: false,
        tracks: [],
    },

    nodes: ["component"],

    tools: ["inspect", "translate", "refactor"],

    panels: ["code", "props", "state"],

    export: {
        formats: ["react", "vue", "svelte", "html"],
    },
};
