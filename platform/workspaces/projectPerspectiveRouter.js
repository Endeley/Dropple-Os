import { resolveCanonicalWorkspaceOverlayContext } from './modeResolution.js';

function normalizeId(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim().toLowerCase();
    return trimmed.length > 0 ? trimmed : null;
}

function freezePerspective(definition) {
    return Object.freeze({
        ...definition,
        entries: Object.freeze([...definition.entries]),
    });
}

export const PROJECT_PERSPECTIVES = Object.freeze({
    overview: freezePerspective({
        id: 'overview',
        label: 'Overview',
        defaultEntryId: 'uiux',
        entries: ['uiux', 'review', 'governance'],
    }),
    create: freezePerspective({
        id: 'create',
        label: 'Create',
        defaultEntryId: 'uiux',
        entries: ['uiux', 'graphic', 'branding', 'icons', 'document', 'animation', 'video', 'audio', 'podcast'],
    }),
    build: freezePerspective({
        id: 'build',
        label: 'Build',
        defaultEntryId: 'application',
        entries: ['application', 'automation', 'logic', 'ai', 'conversion'],
    }),
    operate: freezePerspective({
        id: 'operate',
        label: 'Operate',
        defaultEntryId: 'automation',
        entries: ['automation', 'systems-engineering', 'enterprise-operations', 'production', 'governance'],
    }),
    collaborate: freezePerspective({
        id: 'collaborate',
        label: 'Collaborate',
        defaultEntryId: 'review',
        entries: ['review', 'production', 'knowledge', 'education'],
    }),
    publish: freezePerspective({
        id: 'publish',
        label: 'Publish',
        defaultEntryId: 'governance',
        entries: ['governance', 'versioning', 'tokens', 'components', 'themes', 'variants', 'conversion', 'review'],
    }),
});

const PRIMARY_PERSPECTIVE_BY_ENTRY = Object.freeze({
    uiux: 'create',
    graphic: 'create',
    branding: 'create',
    icons: 'create',
    document: 'create',
    animation: 'create',
    video: 'create',
    audio: 'create',
    podcast: 'create',
    application: 'build',
    logic: 'build',
    automation: 'build',
    ai: 'build',
    conversion: 'build',
    'systems-engineering': 'operate',
    'enterprise-operations': 'operate',
    governance: 'publish',
    review: 'collaborate',
    production: 'collaborate',
    knowledge: 'collaborate',
    education: 'collaborate',
    versioning: 'publish',
    tokens: 'publish',
    components: 'publish',
    themes: 'publish',
    variants: 'publish',
});

const FALLBACK_PERSPECTIVE_ID = 'overview';

const PROJECT_PERSPECTIVE_FOCUS = Object.freeze({
    overview: Object.freeze({
        primaryArtifactKind: 'project-hub',
        secondaryArtifactKinds: Object.freeze(['document', 'workflow', 'knowledge-page']),
    }),
    create: Object.freeze({
        primaryArtifactKind: 'frame',
        secondaryArtifactKinds: Object.freeze(['document', 'animation', 'video']),
    }),
    build: Object.freeze({
        primaryArtifactKind: 'workflow',
        secondaryArtifactKinds: Object.freeze(['state-machine', 'ai-agent', 'system-model']),
    }),
    operate: Object.freeze({
        primaryArtifactKind: 'system-model',
        secondaryArtifactKinds: Object.freeze(['workflow', 'state-machine', 'knowledge-page']),
    }),
    collaborate: Object.freeze({
        primaryArtifactKind: 'knowledge-page',
        secondaryArtifactKinds: Object.freeze(['document', 'workflow', 'component-library']),
    }),
    publish: Object.freeze({
        primaryArtifactKind: 'document',
        secondaryArtifactKinds: Object.freeze(['video', 'animation', 'component-library']),
    }),
});

function validatePerspectiveRegistry() {
    for (const [perspectiveId, perspective] of Object.entries(PROJECT_PERSPECTIVES)) {
        if (perspective.id !== perspectiveId) {
            throw new Error(
                `[Dropple Constitution] Project perspective id mismatch: key=${perspectiveId}, value=${perspective.id}`,
            );
        }

        if (!perspective.entries.includes(perspective.defaultEntryId)) {
            throw new Error(
                `[Dropple Constitution] Project perspective "${perspectiveId}" defaultEntryId "${perspective.defaultEntryId}" is not listed in entries`,
            );
        }

        for (const entryId of perspective.entries) {
            const resolved = resolveCanonicalWorkspaceOverlayContext({ modeId: entryId });
            if (!resolved || resolved.source === 'fallback') {
                throw new Error(
                    `[Dropple Constitution] Project perspective "${perspectiveId}" references unknown entry "${entryId}"`,
                );
            }
        }
    }
}

validatePerspectiveRegistry();

export function listProjectPerspectiveIds() {
    return Object.keys(PROJECT_PERSPECTIVES).sort();
}

export function hasProjectPerspective(perspectiveId) {
    const normalized = normalizeId(perspectiveId);
    return Boolean(normalized && PROJECT_PERSPECTIVES[normalized]);
}

export function getProjectPerspectiveDefinition(perspectiveId) {
    const normalized = normalizeId(perspectiveId);
    return normalized ? PROJECT_PERSPECTIVES[normalized] ?? null : null;
}

export function resolveProjectPerspectiveContext({ perspectiveId, entryId } = {}) {
    const normalizedPerspectiveId = normalizeId(perspectiveId);
    const perspective =
        (normalizedPerspectiveId && PROJECT_PERSPECTIVES[normalizedPerspectiveId]) ||
        PROJECT_PERSPECTIVES[FALLBACK_PERSPECTIVE_ID];

    const normalizedEntryId = normalizeId(entryId);
    const allowedEntryId =
        normalizedEntryId && perspective.entries.includes(normalizedEntryId)
            ? normalizedEntryId
            : perspective.defaultEntryId;

    const resolved = resolveCanonicalWorkspaceOverlayContext({ modeId: allowedEntryId });

    return Object.freeze({
        perspectiveId: perspective.id,
        perspectiveLabel: perspective.label,
        perspectiveSource:
            perspective.id === normalizedPerspectiveId ? 'perspective-direct' : 'perspective-fallback',
        entryId: allowedEntryId,
        entrySource:
            normalizedEntryId && normalizedEntryId === allowedEntryId ? 'entry-direct' : 'entry-default',
        workspaceId: resolved.workspaceId,
        modeId: resolved.modeId,
        definitionId: resolved.definitionId,
        overlayId: resolved.overlayId,
        overlayClass: resolved.overlayClass,
        canonicalModeId: resolved.canonicalModeId,
    });
}

export function resolveProjectPerspectiveForEntry({ entryId } = {}) {
    const normalizedEntryId = normalizeId(entryId);
    if (!normalizedEntryId) return null;

    const resolved = resolveCanonicalWorkspaceOverlayContext({ modeId: normalizedEntryId });
    const candidates = [
        normalizedEntryId,
        resolved?.overlayId ?? null,
        resolved?.modeId ?? null,
        resolved?.canonicalModeId ?? null,
        resolved?.definitionId ?? null,
    ].filter(Boolean);

    const mappedPerspectiveId = candidates
        .map((candidate) => PRIMARY_PERSPECTIVE_BY_ENTRY[candidate] ?? null)
        .find(Boolean);

    if (!mappedPerspectiveId) return null;

    const perspective = PROJECT_PERSPECTIVES[mappedPerspectiveId];
    const preferredEntryId =
        candidates.find((candidate) => perspective.entries.includes(candidate)) ?? perspective.defaultEntryId;

    return resolveProjectPerspectiveContext({
        perspectiveId: mappedPerspectiveId,
        entryId: preferredEntryId,
    });
}

export function resolveProjectPerspectiveFocus({ perspectiveId, entryId } = {}) {
    const context = resolveProjectPerspectiveContext({ perspectiveId, entryId });
    const focus = PROJECT_PERSPECTIVE_FOCUS[context.perspectiveId] ?? PROJECT_PERSPECTIVE_FOCUS.overview;

    return Object.freeze({
        ...context,
        primaryArtifactKind: focus.primaryArtifactKind,
        secondaryArtifactKinds: focus.secondaryArtifactKinds,
    });
}

export function resolveInitialProjectPerspectiveContext({ document, perspectiveId, entryId } = {}) {
    const bootstrapPerspectiveId = normalizeId(document?.meta?.projectBootstrap?.defaultPerspectiveId);
    const preferredPerspectiveId = normalizeId(perspectiveId) ?? bootstrapPerspectiveId ?? FALLBACK_PERSPECTIVE_ID;
    const context = resolveProjectPerspectiveContext({
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
