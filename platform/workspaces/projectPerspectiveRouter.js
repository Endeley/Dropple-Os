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
        entries: ['uiux', 'graphic', 'document', 'animation', 'video', 'audio'],
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
        entries: ['governance', 'versioning', 'conversion', 'review'],
    }),
});

const FALLBACK_PERSPECTIVE_ID = 'overview';

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
