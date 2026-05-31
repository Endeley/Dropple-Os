function normalizeId(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim().toLowerCase();
    return trimmed.length > 0 ? trimmed : null;
}

const PROJECT_PERSPECTIVES = Object.freeze({
    overview: Object.freeze({
        id: 'overview',
        label: 'Overview',
        defaultEntryId: 'uiux',
        entries: Object.freeze(['uiux', 'review', 'governance']),
    }),
    create: Object.freeze({
        id: 'create',
        label: 'Create',
        defaultEntryId: 'uiux',
        entries: Object.freeze(['uiux', 'graphic', 'branding', 'icons', 'document', 'animation', 'video', 'audio', 'podcast']),
    }),
    build: Object.freeze({
        id: 'build',
        label: 'Build',
        defaultEntryId: 'application',
        entries: Object.freeze(['application', 'automation', 'logic', 'ai', 'conversion']),
    }),
    operate: Object.freeze({
        id: 'operate',
        label: 'Operate',
        defaultEntryId: 'automation',
        entries: Object.freeze(['automation', 'systems-engineering', 'enterprise-operations', 'production', 'governance']),
    }),
    collaborate: Object.freeze({
        id: 'collaborate',
        label: 'Collaborate',
        defaultEntryId: 'review',
        entries: Object.freeze(['review', 'production', 'knowledge', 'education']),
    }),
    publish: Object.freeze({
        id: 'publish',
        label: 'Publish',
        defaultEntryId: 'governance',
        entries: Object.freeze(['governance', 'versioning', 'tokens', 'components', 'themes', 'variants', 'conversion', 'review']),
    }),
});

const ENTRY_CONTEXT_BY_ID = Object.freeze({
    uiux: Object.freeze({ workspaceId: 'design', modeId: 'uiux', overlayId: null }),
    review: Object.freeze({ workspaceId: 'collaborate', modeId: 'review', overlayId: null }),
    governance: Object.freeze({ workspaceId: 'system', modeId: 'governance', overlayId: null }),
    graphic: Object.freeze({ workspaceId: 'design', modeId: 'graphic', overlayId: null }),
    branding: Object.freeze({ workspaceId: 'design', modeId: 'branding', overlayId: 'brand-systems' }),
    icons: Object.freeze({ workspaceId: 'design', modeId: 'icons', overlayId: 'icon-systems' }),
    document: Object.freeze({ workspaceId: 'design', modeId: 'document', overlayId: null }),
    animation: Object.freeze({ workspaceId: 'media', modeId: 'animation', overlayId: null }),
    video: Object.freeze({ workspaceId: 'media', modeId: 'video', overlayId: null }),
    audio: Object.freeze({ workspaceId: 'media', modeId: 'audio', overlayId: null }),
    podcast: Object.freeze({ workspaceId: 'media', modeId: 'podcast', overlayId: 'podcast' }),
    application: Object.freeze({ workspaceId: 'build', modeId: 'application', overlayId: null }),
    automation: Object.freeze({ workspaceId: 'build', modeId: 'automation', overlayId: null }),
    logic: Object.freeze({ workspaceId: 'build', modeId: 'logic', overlayId: null }),
    ai: Object.freeze({ workspaceId: 'build', modeId: 'ai-build', overlayId: 'ai-systems' }),
    conversion: Object.freeze({ workspaceId: 'build', modeId: 'conversion', overlayId: 'conversion' }),
    'systems-engineering': Object.freeze({
        workspaceId: 'build',
        modeId: 'systems-engineering',
        overlayId: 'systems-engineering',
    }),
    'enterprise-operations': Object.freeze({
        workspaceId: 'build',
        modeId: 'enterprise-operations',
        overlayId: 'enterprise-operations',
    }),
    production: Object.freeze({ workspaceId: 'collaborate', modeId: 'production', overlayId: null }),
    knowledge: Object.freeze({ workspaceId: 'collaborate', modeId: 'knowledge', overlayId: null }),
    education: Object.freeze({ workspaceId: 'collaborate', modeId: 'education', overlayId: 'learning' }),
    versioning: Object.freeze({ workspaceId: 'system', modeId: 'versioning', overlayId: 'versioning' }),
    tokens: Object.freeze({ workspaceId: 'system', modeId: 'tokens', overlayId: null }),
    components: Object.freeze({ workspaceId: 'system', modeId: 'components', overlayId: null }),
    themes: Object.freeze({ workspaceId: 'system', modeId: 'themes', overlayId: 'themes' }),
    variants: Object.freeze({ workspaceId: 'system', modeId: 'variants', overlayId: 'variants' }),
});

const FALLBACK_PERSPECTIVE_ID = 'overview';

export function resolveRuntimeProjectPerspectiveContext({ perspectiveId, entryId } = {}) {
    const normalizedPerspectiveId = normalizeId(perspectiveId);
    const perspective =
        (normalizedPerspectiveId && PROJECT_PERSPECTIVES[normalizedPerspectiveId]) ||
        PROJECT_PERSPECTIVES[FALLBACK_PERSPECTIVE_ID];

    const normalizedEntryId = normalizeId(entryId);
    const resolvedEntryId =
        normalizedEntryId && perspective.entries.includes(normalizedEntryId)
            ? normalizedEntryId
            : perspective.defaultEntryId;
    const entryContext = ENTRY_CONTEXT_BY_ID[resolvedEntryId] ?? ENTRY_CONTEXT_BY_ID.uiux;

    return Object.freeze({
        perspectiveId: perspective.id,
        perspectiveLabel: perspective.label,
        perspectiveSource:
            perspective.id === normalizedPerspectiveId ? 'perspective-direct' : 'perspective-fallback',
        entryId: resolvedEntryId,
        entrySource:
            normalizedEntryId && normalizedEntryId === resolvedEntryId ? 'entry-direct' : 'entry-default',
        workspaceId: entryContext.workspaceId,
        modeId: entryContext.modeId,
        overlayId: entryContext.overlayId,
    });
}

export function resolveInitialRuntimeProjectPerspectiveContext({ document, perspectiveId, entryId } = {}) {
    const bootstrapPerspectiveId = normalizeId(document?.meta?.projectBootstrap?.defaultPerspectiveId);
    const preferredPerspectiveId = normalizeId(perspectiveId) ?? bootstrapPerspectiveId ?? FALLBACK_PERSPECTIVE_ID;
    const context = resolveRuntimeProjectPerspectiveContext({
        perspectiveId: preferredPerspectiveId,
        entryId,
    });

    return Object.freeze({
        ...context,
        bootstrapPerspectiveId,
        bootstrapApplied: Boolean(
            bootstrapPerspectiveId &&
                context.perspectiveId === bootstrapPerspectiveId &&
                normalizeId(perspectiveId) === null,
        ),
    });
}
