export const uiuxStarterGraph = {
    rootId: 'root',
    nodes: [
        { id: 'root', type: 'frame' },
        { id: 'header', type: 'frame' },
        { id: 'hero', type: 'frame' },
        { id: 'footer', type: 'frame' },
        { id: 'heroTitle', type: 'text' },
        { id: 'ctaButton', type: 'frame' },
    ],
    tree: {
        root: ['header', 'hero', 'footer'],
        header: [],
        hero: ['heroTitle', 'ctaButton'],
        footer: [],
        heroTitle: [],
        ctaButton: [],
    },
};
