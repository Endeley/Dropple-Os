import { resolveBlueprintCatalogEntry } from '@/runtime/blueprints/resolveBlueprintCatalogEntry.js';
import {
    applyWorkspaceLaunchContextToSearchParams,
    createWorkspaceLaunchContext,
} from './workspaceLaunchContext.js';

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizePerspectiveId(value) {
    return asNonEmptyString(value)?.toLowerCase() ?? 'create';
}

function resolveBlueprintLaunchTruth({
    blueprintId,
    blueprintVersionId = null,
    certificationHash = null,
} = {}) {
    const normalizedBlueprintId = asNonEmptyString(blueprintId);
    if (!normalizedBlueprintId) return null;

    return resolveBlueprintCatalogEntry({
        blueprintId: normalizedBlueprintId,
        blueprintVersionId,
        certificationHash,
    });
}

export function createBlueprintLaunchContext({
    blueprintId,
    blueprintVersionId = null,
    certificationHash = null,
} = {}) {
    const resolved = resolveBlueprintLaunchTruth({
        blueprintId,
        blueprintVersionId,
        certificationHash,
    });
    if (!resolved) return null;

    return createWorkspaceLaunchContext({
        blueprint: {
            id: resolved.blueprintId,
            versionId: resolved.blueprintVersionId,
        },
        certification: {
            blueprint: 'dropple-certified',
        },
    });
}

export function buildBlueprintLaunchHref({
    perspectiveId = 'create',
    blueprintId,
    blueprintVersionId = null,
    certificationHash = null,
} = {}) {
    const normalizedPerspectiveId = normalizePerspectiveId(perspectiveId);
    const launchContext = createBlueprintLaunchContext({
        blueprintId,
        blueprintVersionId,
        certificationHash,
    });

    if (!launchContext) {
        return `/workspace/${encodeURIComponent(normalizedPerspectiveId)}`;
    }

    const searchParams = applyWorkspaceLaunchContextToSearchParams({
        launchContext,
    });
    searchParams.set('bootstrap', '1');

    return `/workspace/${encodeURIComponent(normalizedPerspectiveId)}?${searchParams.toString()}`;
}
