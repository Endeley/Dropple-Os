export const WORKSPACE_LAUNCH_CONTEXT_VERSION = 1;

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function readQueryField(searchParams, key) {
    if (!searchParams) return null;
    if (typeof searchParams.get === 'function') {
        return asNonEmptyString(searchParams.get(key));
    }
    const raw = searchParams?.[key];
    if (Array.isArray(raw)) return asNonEmptyString(raw[0] ?? null);
    return asNonEmptyString(raw ?? null);
}

function createVersionedReference({ id = null, versionId = null } = {}) {
    const normalizedId = asNonEmptyString(id);
    const normalizedVersionId = asNonEmptyString(versionId);
    if (!normalizedId && !normalizedVersionId) return null;
    return Object.freeze({
        id: normalizedId,
        versionId: normalizedVersionId,
    });
}

function createCertificationState({ blueprint = null, template = null } = {}) {
    const normalizedBlueprint = asNonEmptyString(blueprint);
    const normalizedTemplate = asNonEmptyString(template);
    if (!normalizedBlueprint && !normalizedTemplate) return null;
    return Object.freeze({
        blueprint: normalizedBlueprint,
        template: normalizedTemplate,
    });
}

export function createWorkspaceLaunchContext({
    language = null,
    category = null,
    blueprint = null,
    template = null,
    grammar = null,
    certification = null,
} = {}) {
    const normalizedLanguage = asNonEmptyString(language);
    const normalizedCategory = asNonEmptyString(category);
    const normalizedGrammar = asNonEmptyString(grammar);
    const normalizedBlueprint = createVersionedReference(blueprint ?? {});
    const normalizedTemplate = createVersionedReference(template ?? {});
    const normalizedCertification = createCertificationState(certification ?? {});

    const hasLaunchTruth = Boolean(
        normalizedLanguage ||
            normalizedCategory ||
            normalizedGrammar ||
            normalizedBlueprint ||
            normalizedTemplate ||
            normalizedCertification,
    );

    if (!hasLaunchTruth) return null;

    return Object.freeze({
        version: WORKSPACE_LAUNCH_CONTEXT_VERSION,
        language: normalizedLanguage,
        category: normalizedCategory,
        blueprint: normalizedBlueprint,
        template: normalizedTemplate,
        grammar: normalizedGrammar,
        certification: normalizedCertification,
    });
}

export function resolveWorkspaceLaunchContextFromSearchParams(searchParams = null) {
    return createWorkspaceLaunchContext({
        language: readQueryField(searchParams, 'language'),
        category: readQueryField(searchParams, 'category'),
        blueprint: {
            id: readQueryField(searchParams, 'blueprint'),
            versionId: readQueryField(searchParams, 'blueprintVersionId'),
        },
        template: {
            id: readQueryField(searchParams, 'template'),
            versionId: readQueryField(searchParams, 'templateVersionId'),
        },
        grammar: readQueryField(searchParams, 'grammar'),
        certification: {
            blueprint: readQueryField(searchParams, 'blueprintCertification'),
            template: readQueryField(searchParams, 'templateCertification'),
        },
    });
}

export function applyWorkspaceLaunchContextToSearchParams({
    launchContext = null,
    searchParams = null,
} = {}) {
    const params = searchParams instanceof URLSearchParams ? new URLSearchParams(searchParams) : new URLSearchParams();
    const context = createWorkspaceLaunchContext(launchContext ?? {});
    if (!context) return params;

    params.set('launchContextVersion', String(context.version));
    if (context.language) params.set('language', context.language);
    if (context.category) params.set('category', context.category);
    if (context.blueprint?.id) params.set('blueprint', context.blueprint.id);
    if (context.blueprint?.versionId) params.set('blueprintVersionId', context.blueprint.versionId);
    if (context.template?.id) params.set('template', context.template.id);
    if (context.template?.versionId) params.set('templateVersionId', context.template.versionId);
    if (context.grammar) params.set('grammar', context.grammar);
    if (context.certification?.blueprint) {
        params.set('blueprintCertification', context.certification.blueprint);
    }
    if (context.certification?.template) {
        params.set('templateCertification', context.certification.template);
    }

    return params;
}
