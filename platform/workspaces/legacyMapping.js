export const LEGACY_WORKSPACE_MAP = Object.freeze({
    graphic: Object.freeze({ workspace: 'design', mode: 'graphic', definitionId: 'graphic' }),
    uiux: Object.freeze({ workspace: 'design', mode: 'uiux', definitionId: 'uiux' }),
    branding: Object.freeze({ workspace: 'design', mode: 'branding', definitionId: 'branding' }),
    icons: Object.freeze({ workspace: 'design', mode: 'icons', definitionId: 'icons' }),
    document: Object.freeze({ workspace: 'design', mode: 'document', definitionId: 'document' }),

    media: Object.freeze({ workspace: 'media', mode: 'animation', definitionId: 'animation' }),
    animation: Object.freeze({ workspace: 'media', mode: 'animation', definitionId: 'animation' }),
    video: Object.freeze({ workspace: 'media', mode: 'video', definitionId: 'video' }),
    podcast: Object.freeze({ workspace: 'media', mode: 'podcast', definitionId: 'podcast' }),

    dev: Object.freeze({ workspace: 'build', mode: 'application', definitionId: 'dev' }),
    conversion: Object.freeze({ workspace: 'build', mode: 'conversion', definitionId: 'conversion' }),
    translate: Object.freeze({ workspace: 'build', mode: 'conversion', definitionId: 'translate' }),
    ai: Object.freeze({ workspace: 'build', mode: 'ai-build', definitionId: 'ai' }),

    material: Object.freeze({ workspace: 'system', mode: 'tokens', definitionId: 'material' }),

    review: Object.freeze({ workspace: 'collaborate', mode: 'review', definitionId: 'review' }),
    education: Object.freeze({
        workspace: 'collaborate',
        mode: 'education',
        definitionId: 'education',
    }),
});
