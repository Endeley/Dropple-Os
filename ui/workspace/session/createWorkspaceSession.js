function freezeVersionedReference(value) {
    if (!value || typeof value !== 'object') return null;
    const id = typeof value.id === 'string' && value.id.trim().length > 0 ? value.id.trim() : null;
    const versionId =
        typeof value.versionId === 'string' && value.versionId.trim().length > 0
            ? value.versionId.trim()
            : null;
    if (!id && !versionId) return null;
    return Object.freeze({ id, versionId });
}

function freezeCertification(value) {
    if (!value || typeof value !== 'object') return null;
    const blueprint =
        typeof value.blueprint === 'string' && value.blueprint.trim().length > 0
            ? value.blueprint.trim()
            : null;
    const template =
        typeof value.template === 'string' && value.template.trim().length > 0
            ? value.template.trim()
            : null;
    if (!blueprint && !template) return null;
    return Object.freeze({ blueprint, template });
}

export function createWorkspaceSession({
    launchContext = null,
    workspaceId = null,
    modeId = null,
} = {}) {
    const sessionLaunchContext =
        launchContext && typeof launchContext === 'object'
            ? Object.freeze({
                  version: Number(launchContext.version ?? 1),
                  language: launchContext.language ?? null,
                  category: launchContext.category ?? null,
                  blueprint: freezeVersionedReference(launchContext.blueprint),
                  template: freezeVersionedReference(launchContext.template),
                  grammar: launchContext.grammar ?? null,
                  certification: freezeCertification(launchContext.certification),
              })
            : null;

    return Object.freeze({
        workspaceId: workspaceId ?? null,
        modeId: modeId ?? null,
        launchContext: sessionLaunchContext,
        language: sessionLaunchContext?.language ?? null,
        category: sessionLaunchContext?.category ?? null,
        blueprint: sessionLaunchContext?.blueprint ?? null,
        template: sessionLaunchContext?.template ?? null,
        grammar: sessionLaunchContext?.grammar ?? null,
        certification: sessionLaunchContext?.certification ?? null,
        hasLaunchContext: Boolean(sessionLaunchContext),
    });
}
