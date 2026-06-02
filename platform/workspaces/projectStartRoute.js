import { resolveCanonicalWorkspaceOverlayContext } from './modeResolution.js';

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizePerspectiveId(value) {
    return asNonEmptyString(value)?.toLowerCase() ?? 'create';
}

export function buildProjectBlueprintStartRoute({
    perspectiveId = 'create',
    blueprintId,
} = {}) {
    const normalizedPerspectiveId = normalizePerspectiveId(perspectiveId);
    const normalizedBlueprintId = asNonEmptyString(blueprintId);
    if (!normalizedBlueprintId) {
        return `/workspace/${encodeURIComponent(normalizedPerspectiveId)}`;
    }
    return `/workspace/${encodeURIComponent(normalizedPerspectiveId)}?blueprint=${encodeURIComponent(normalizedBlueprintId)}&bootstrap=1`;
}

export function buildProjectEnvironmentStartRoute({
    perspectiveId = 'create',
    workspaceId = null,
    modeId = null,
    overlayId = null,
    lineageRootId = null,
    versionId = null,
} = {}) {
    const normalizedPerspectiveId = normalizePerspectiveId(perspectiveId);
    const normalizedLineageRootId = asNonEmptyString(lineageRootId);
    const normalizedVersionId = asNonEmptyString(versionId);
    if (!normalizedLineageRootId || !normalizedVersionId) {
        return `/workspace/${encodeURIComponent(normalizedPerspectiveId)}`;
    }

    const resolvedContext = resolveCanonicalWorkspaceOverlayContext({ workspaceId, modeId });
    const entryId =
        asNonEmptyString(overlayId) ??
        asNonEmptyString(resolvedContext?.overlayId) ??
        asNonEmptyString(resolvedContext?.canonicalModeId) ??
        asNonEmptyString(resolvedContext?.modeId);

    if (!resolvedContext?.workspaceId || !resolvedContext?.canonicalModeId || !entryId) {
        return `/workspace/${encodeURIComponent(normalizedPerspectiveId)}`;
    }

    const searchParams = new URLSearchParams({
        entry: entryId,
        workspaceId: resolvedContext.workspaceId,
        modeId: resolvedContext.canonicalModeId,
        lineageRootId: normalizedLineageRootId,
        versionId: normalizedVersionId,
    });

    const resolvedOverlayId = asNonEmptyString(overlayId) ?? asNonEmptyString(resolvedContext?.overlayId);
    if (resolvedOverlayId) {
        searchParams.set('overlayId', resolvedOverlayId);
    }

    return `/workspace/${encodeURIComponent(normalizedPerspectiveId)}?${searchParams.toString()}`;
}
