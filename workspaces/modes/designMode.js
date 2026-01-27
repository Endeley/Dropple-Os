// workspaces/modes/designMode.js

export const DesignMode = {
    id: 'design',
    label: 'Design',
    description: 'Full editing mode with creation and mutation enabled.',

    // This mode allows full editor behavior
    profile: 'design',

    capabilities: {
        edit: true,
        mutate: true,
        inspect: true,
        review: false,
    },

    // Optional: default workspace fallback
    defaultWorkspace: 'graphic',
};
