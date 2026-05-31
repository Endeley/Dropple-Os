import { validateBlueprintInstallManifestV1 } from '@/core/contracts/blueprintInstallManifest.v1.js';

function normalizeNonEmptyString(value, fallback = '') {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
}

export function createBlueprintInstallManifest({
    projectId,
    projectName,
    defaultPerspectiveId,
    blueprint = null,
} = {}) {
    const blueprintId = normalizeNonEmptyString(blueprint?.id, '');
    const blueprintVersionId = normalizeNonEmptyString(blueprint?.lineage?.versionId, blueprintId);

    const manifest = {
        schemaVersion: 1,
        projectId: normalizeNonEmptyString(projectId, blueprintId),
        projectName: normalizeNonEmptyString(projectName, blueprint?.name ?? 'Untitled Project'),
        defaultPerspectiveId: normalizeNonEmptyString(defaultPerspectiveId, 'overview'),
        blueprintId,
        blueprintVersionId,
    };

    return validateBlueprintInstallManifestV1(manifest);
}
