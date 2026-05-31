import { installBlueprint } from '@/runtime/blueprints/installBlueprint.js';
import { listBlueprintCatalog, resolveBlueprintFromCatalog } from '@/runtime/blueprints/blueprintCatalog.js';

function normalizeId(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function listBlueprintInstallOptions() {
    return listBlueprintCatalog().map((blueprint) =>
        Object.freeze({
            id: blueprint.id,
            name: blueprint.name,
            description: blueprint.description,
            versionId: blueprint?.lineage?.versionId ?? blueprint.id,
        }),
    );
}

export async function installBlueprintFromCatalog({
    dispatcher,
    blueprintId,
    projectId,
    projectName,
    defaultPerspectiveId = 'create',
} = {}) {
    const resolvedBlueprintId = normalizeId(blueprintId);
    if (!resolvedBlueprintId) {
        throw new Error('Blueprint id is required.');
    }

    const blueprint = resolveBlueprintFromCatalog(resolvedBlueprintId);
    if (!blueprint) {
        throw new Error(`Unknown blueprint: ${resolvedBlueprintId}`);
    }

    const manifest = Object.freeze({
        schemaVersion: 1,
        projectId: normalizeId(projectId) ?? blueprint.id,
        projectName: normalizeId(projectName) ?? blueprint.name,
        defaultPerspectiveId: normalizeId(defaultPerspectiveId) ?? 'create',
        blueprintId: blueprint.id,
        blueprintVersionId: blueprint?.lineage?.versionId ?? blueprint.id,
    });

    return installBlueprint({
        dispatcher,
        blueprint,
        manifest,
    });
}

