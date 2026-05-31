import { installBlueprint } from '@/runtime/blueprints/installBlueprint.js';
import { listBlueprintCatalog } from '@/runtime/blueprints/blueprintCatalog.js';
import { resolveBlueprintCatalogEntry } from '@/runtime/blueprints/resolveBlueprintCatalogEntry.js';

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
            certificationHash: blueprint?.certification?.hash ?? null,
            workspaceProfiles: blueprint?.workspaceProfiles ?? Object.freeze({}),
            seedEventCount: Array.isArray(blueprint?.seedEvents) ? blueprint.seedEvents.length : 0,
        }),
    );
}

export async function installBlueprintFromCatalog({
    dispatcher,
    blueprintId,
    blueprintVersionId = null,
    certificationHash = null,
    projectId,
    projectName,
    defaultPerspectiveId = 'create',
} = {}) {
    const resolvedBlueprintId = normalizeId(blueprintId);
    if (!resolvedBlueprintId) {
        throw new Error('Blueprint id is required.');
    }

    const resolvedCatalogEntry = resolveBlueprintCatalogEntry({
        blueprintId: resolvedBlueprintId,
        blueprintVersionId,
        certificationHash,
    });
    const { blueprint } = resolvedCatalogEntry;

    const manifest = Object.freeze({
        schemaVersion: 1,
        projectId: normalizeId(projectId) ?? blueprint.id,
        projectName: normalizeId(projectName) ?? blueprint.name,
        defaultPerspectiveId: normalizeId(defaultPerspectiveId) ?? 'create',
        blueprintId: resolvedCatalogEntry.blueprintId,
        blueprintVersionId: resolvedCatalogEntry.blueprintVersionId,
    });

    return installBlueprint({
        dispatcher,
        blueprint,
        manifest,
    });
}
