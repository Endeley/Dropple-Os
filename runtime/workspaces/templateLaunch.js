import { buildProjectEnvironmentStartRoute } from '../../platform/workspaces/projectStartRoute.js';
import { resolveCanonicalWorkspaceOverlayContext } from '../../platform/workspaces/index.js';
import {
    applyWorkspaceLaunchContextToSearchParams,
    createWorkspaceLaunchContext,
} from './workspaceLaunchContext.js';

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function resolveTemplateLineage(template) {
    const lineageRootId =
        asNonEmptyString(template?.lineageRootId) ??
        asNonEmptyString(template?.certification?.lineageRootId) ??
        asNonEmptyString(template?.lineage?.rootId) ??
        asNonEmptyString(template?.lineage?.lineageRootId);
    const versionId =
        asNonEmptyString(template?.versionId) ??
        asNonEmptyString(template?.certification?.lineageNodeId) ??
        asNonEmptyString(template?.lineage?.nodeId) ??
        asNonEmptyString(template?.lineage?.versionId);

    if (!lineageRootId || !versionId) return null;
    return Object.freeze({ lineageRootId, versionId });
}

function resolveTemplateCertificationState(template) {
    if (!template || typeof template !== 'object') return null;

    if (
        template?.certification?.certified === true ||
        typeof template?.certification?.signature === 'string' ||
        typeof template?.certification?.certificationHash === 'string'
    ) {
        return 'dropple-certified';
    }

    return null;
}

function resolveTemplateLaunchCategory(template) {
    return (
        asNonEmptyString(template?.category) ??
        asNonEmptyString(template?.metadata?.category) ??
        asNonEmptyString(template?.blueprintCategory) ??
        null
    );
}

function resolveTemplateLaunchOwnership(template) {
    const overlayContext = resolveCanonicalWorkspaceOverlayContext({
        workspaceId: template?.workspaceId ?? null,
        modeId: template?.modeId ?? template?.mode ?? null,
    });

    const workspaceId = asNonEmptyString(overlayContext?.workspaceId);
    const modeId =
        asNonEmptyString(overlayContext?.canonicalModeId) ??
        asNonEmptyString(overlayContext?.modeId);
    const overlayId = asNonEmptyString(overlayContext?.overlayId);

    if (!workspaceId || !modeId) return null;

    return Object.freeze({
        workspaceId,
        modeId,
        overlayId,
    });
}

export function createTemplateDetailLaunchContext(template) {
    const templateId = asNonEmptyString(template?.id);
    const lineage = resolveTemplateLineage(template);
    const ownership = resolveTemplateLaunchOwnership(template);

    if (!templateId || !lineage || !ownership) return null;

    return createWorkspaceLaunchContext({
        language: ownership.modeId,
        category: resolveTemplateLaunchCategory(template),
        template: {
            id: templateId,
            versionId: lineage.versionId,
        },
        grammar: 'create',
        certification: {
            template: resolveTemplateCertificationState(template),
        },
    });
}

export function buildTemplateDetailLaunchHref(template) {
    const launchContext = createTemplateDetailLaunchContext(template);
    const lineage = resolveTemplateLineage(template);
    const ownership = resolveTemplateLaunchOwnership(template);

    if (!launchContext || !lineage || !ownership) {
        return '/workspace/create';
    }

    const legacyRoute = buildProjectEnvironmentStartRoute({
        perspectiveId: 'create',
        workspaceId: ownership.workspaceId,
        modeId: ownership.modeId,
        overlayId: ownership.overlayId,
        lineageRootId: lineage.lineageRootId,
        versionId: lineage.versionId,
    });

    const url = new URL(legacyRoute, 'https://dropple.test');
    url.searchParams.delete('workspaceId');
    url.searchParams.delete('modeId');
    url.searchParams.delete('versionId');
    const searchParams = applyWorkspaceLaunchContextToSearchParams({
        launchContext,
        searchParams: url.searchParams,
    });

    const query = searchParams.toString();
    return query.length > 0 ? `${url.pathname}?${query}` : url.pathname;
}
