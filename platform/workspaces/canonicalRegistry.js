export const CANONICAL_WORKSPACES = Object.freeze({
    design: Object.freeze({
        id: 'design',
        label: 'Design',
        modes: Object.freeze({
            uiux: Object.freeze({ id: 'uiux', label: 'UI / UX' }),
            graphic: Object.freeze({ id: 'graphic', label: 'Graphic' }),
            branding: Object.freeze({ id: 'branding', label: 'Branding' }),
            icons: Object.freeze({ id: 'icons', label: 'Icons' }),
            document: Object.freeze({ id: 'document', label: 'Document' }),
        }),
    }),
    media: Object.freeze({
        id: 'media',
        label: 'Media',
        modes: Object.freeze({
            animation: Object.freeze({ id: 'animation', label: 'Animation' }),
            video: Object.freeze({ id: 'video', label: 'Video' }),
            podcast: Object.freeze({ id: 'podcast', label: 'Podcast' }),
        }),
    }),
    build: Object.freeze({
        id: 'build',
        label: 'Build',
        modes: Object.freeze({
            application: Object.freeze({ id: 'application', label: 'Application' }),
            logic: Object.freeze({ id: 'logic', label: 'Logic' }),
            'state-machine': Object.freeze({ id: 'state-machine', label: 'State Machine' }),
            api: Object.freeze({ id: 'api', label: 'API' }),
            conversion: Object.freeze({ id: 'conversion', label: 'Conversion' }),
            'ai-build': Object.freeze({ id: 'ai-build', label: 'AI Build' }),
        }),
    }),
    system: Object.freeze({
        id: 'system',
        label: 'System',
        modes: Object.freeze({
            tokens: Object.freeze({ id: 'tokens', label: 'Tokens' }),
            components: Object.freeze({ id: 'components', label: 'Components' }),
            variants: Object.freeze({ id: 'variants', label: 'Variants' }),
            themes: Object.freeze({ id: 'themes', label: 'Themes' }),
        }),
    }),
    collaborate: Object.freeze({
        id: 'collaborate',
        label: 'Collaborate',
        modes: Object.freeze({
            review: Object.freeze({ id: 'review', label: 'Review' }),
            comments: Object.freeze({ id: 'comments', label: 'Comments' }),
            production: Object.freeze({ id: 'production', label: 'Production' }),
            knowledge: Object.freeze({ id: 'knowledge', label: 'Knowledge' }),
            education: Object.freeze({ id: 'education', label: 'Education' }),
        }),
    }),
});
