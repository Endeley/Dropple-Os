import { installBlueprint } from '@/runtime/blueprints/installBlueprint.js';
import {
    listBlueprintCatalog,
    resolveBlueprintFromCatalogByVersionId,
} from '@/runtime/blueprints/blueprintCatalog.js';
import { resolveBlueprintCatalogEntry } from '@/runtime/blueprints/resolveBlueprintCatalogEntry.js';
import { resolveBlueprintCompositionFromCatalog } from '@/runtime/blueprints/resolveBlueprintCompositionFromCatalog.js';
import { applyBlueprintUpgrade } from '@/runtime/blueprints/applyBlueprintUpgrade.js';
import { diffBlueprintUpgrade, isBlueprintUpgradeAdditive } from '@/runtime/blueprints/diffBlueprintUpgrade.js';
import {
    DEFAULT_BLUEPRINT_UPGRADE_MERGE_POLICY,
    evaluateBlueprintUpgradeMergePolicy,
} from '@/runtime/blueprints/blueprintUpgradeMergePolicy.js';
import { verifyBlueprintCertification } from '@/runtime/blueprints/installBlueprint.js';

function normalizeId(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function parseBooleanFlag(value) {
    if (typeof value !== 'string') return false;
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function readQueryField(searchParams, key) {
    if (!searchParams) return null;
    if (typeof searchParams.get === 'function') {
        return searchParams.get(key);
    }
    const raw = searchParams?.[key];
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw ?? null;
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

export function resolveProjectBlueprintRouteSelection({
    searchParams = null,
    launchContext = null,
    installOptions = listBlueprintInstallOptions(),
} = {}) {
    const optionsById = new Map(installOptions.map((option) => [String(option.id), option]));
    const requestedIds = [];

    const launchBlueprintId = normalizeId(launchContext?.blueprint?.id);
    if (launchBlueprintId) {
        requestedIds.push(launchBlueprintId);
    } else {
        const blueprintToken = readQueryField(searchParams, 'blueprint');
        const blueprintsToken = readQueryField(searchParams, 'blueprints');
        if (typeof blueprintsToken === 'string' && blueprintsToken.trim().length > 0) {
            for (const id of blueprintsToken.split(',')) {
                const normalized = normalizeId(id);
                if (normalized) requestedIds.push(normalized);
            }
        } else {
            const normalized = normalizeId(blueprintToken);
            if (normalized) requestedIds.push(normalized);
        }
    }
    const dedupedIds = [];
    const seen = new Set();
    for (const id of requestedIds) {
        if (!optionsById.has(id)) continue;
        if (seen.has(id)) continue;
        seen.add(id);
        dedupedIds.push(id);
    }
    const autoBootstrap = parseBooleanFlag(readQueryField(searchParams, 'bootstrap'));

    return Object.freeze({
        blueprintIds: Object.freeze(dedupedIds),
        autoBootstrap,
    });
}

function createProjectManifest({
    blueprint,
    projectId,
    projectName,
    defaultPerspectiveId = 'create',
} = {}) {
    return Object.freeze({
        schemaVersion: 1,
        projectId: normalizeId(projectId) ?? blueprint.id,
        projectName: normalizeId(projectName) ?? blueprint.name,
        defaultPerspectiveId: normalizeId(defaultPerspectiveId) ?? 'create',
        blueprintId: blueprint.id,
        blueprintVersionId: blueprint?.lineage?.versionId ?? blueprint.id,
    });
}

export async function createProjectFromBlueprintCatalog({
    dispatcher,
    blueprintEntries,
    projectId,
    projectName,
    defaultPerspectiveId = 'create',
} = {}) {
    if (!Array.isArray(blueprintEntries) || blueprintEntries.length === 0) {
        throw new Error('At least one blueprint entry is required.');
    }
    const normalizedEntries = blueprintEntries.map((entry) => {
        if (typeof entry === 'string') return Object.freeze({ blueprintId: entry });
        if (!entry || typeof entry !== 'object') {
            throw new Error('Each blueprint entry must be a string id or object.');
        }
        return Object.freeze({
            blueprintId: entry.blueprintId,
            blueprintVersionId: entry.blueprintVersionId ?? null,
            certificationHash: entry.certificationHash ?? null,
        });
    });

    const isComposite = normalizedEntries.length > 1;
    let blueprint;
    let sourceBlueprints;
    let compositionHash = null;

    if (isComposite) {
        const resolvedComposition = resolveBlueprintCompositionFromCatalog({
            entries: normalizedEntries,
            compositeId: normalizedEntries.map((entry) => String(entry.blueprintId)).join('.'),
            compositeName: `Composed ${normalizedEntries.length} blueprints`,
            compositeDescription: 'Composed blueprint package',
            kind: 'project',
        });
        blueprint = resolvedComposition.blueprint;
        compositionHash = resolvedComposition.compositionHash;
        sourceBlueprints = resolvedComposition.entries.map((entry) =>
            Object.freeze({
                blueprintId: entry.blueprintId,
                blueprintVersionId: entry.blueprintVersionId,
                certificationHash: entry.certificationHash,
            }),
        );
    } else {
        const resolved = resolveBlueprintCatalogEntry(normalizedEntries[0]);
        blueprint = resolved.blueprint;
        sourceBlueprints = [
            Object.freeze({
                blueprintId: resolved.blueprintId,
                blueprintVersionId: resolved.blueprintVersionId,
                certificationHash: resolved.certificationHash,
            }),
        ];
    }
    const manifest = createProjectManifest({ blueprint, projectId, projectName, defaultPerspectiveId });

    const result = await installBlueprint({
        dispatcher,
        blueprint,
        manifest,
    });
    return Object.freeze({
        ...result,
        composed: isComposite,
        compositionHash,
        sourceBlueprints: Object.freeze(sourceBlueprints),
    });
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
    return createProjectFromBlueprintCatalog({
        dispatcher,
        blueprintEntries: [
            Object.freeze({
                blueprintId: resolvedBlueprintId,
                blueprintVersionId,
                certificationHash,
            }),
        ],
        projectId,
        projectName,
        defaultPerspectiveId,
    });
}

export async function installComposedBlueprintFromCatalog({
    dispatcher,
    blueprintEntries,
    projectId,
    projectName,
    defaultPerspectiveId = 'create',
} = {}) {
    return createProjectFromBlueprintCatalog({
        dispatcher,
        blueprintEntries,
        projectId,
        projectName,
        defaultPerspectiveId,
    });
}

export function resolveInstalledBlueprintFromBootstrap(projectBootstrap) {
    const versionId = normalizeId(projectBootstrap?.blueprintVersionId);
    if (!versionId) return null;
    return resolveBlueprintFromCatalogByVersionId(versionId);
}

export function listBlueprintUpgradeTargets({ projectBootstrap } = {}) {
    const installedBlueprint = resolveInstalledBlueprintFromBootstrap(projectBootstrap);
    if (!installedBlueprint) return Object.freeze([]);
    const installedVersionId = String(installedBlueprint?.lineage?.versionId ?? '');
    const installedRootId = String(installedBlueprint?.lineage?.rootId ?? '');
    if (installedVersionId.length === 0 || installedRootId.length === 0) return Object.freeze([]);

    const targets = listBlueprintCatalog()
        .filter(
            (candidate) =>
                String(candidate?.lineage?.rootId ?? '') === installedRootId &&
                String(candidate?.lineage?.parentVersionId ?? '') === installedVersionId,
        )
        .map((candidate) =>
            Object.freeze({
                id: candidate.id,
                name: candidate.name,
                versionId: candidate?.lineage?.versionId ?? candidate.id,
                certificationHash: candidate?.certification?.hash ?? null,
            }),
        );

    return Object.freeze(targets);
}

export function previewBlueprintUpgradeFromCatalog({
    projectBootstrap,
    targetBlueprintVersionId,
} = {}) {
    const fromBlueprint = resolveInstalledBlueprintFromBootstrap(projectBootstrap);
    if (!fromBlueprint) {
        throw new Error('No installed blueprint provenance found.');
    }
    const targetVersionId = normalizeId(targetBlueprintVersionId);
    if (!targetVersionId) {
        throw new Error('Upgrade target version is required.');
    }
    const toBlueprint = resolveBlueprintFromCatalogByVersionId(targetVersionId);
    if (!toBlueprint) {
        throw new Error(`Unknown upgrade target version: ${targetVersionId}`);
    }

    const diff = diffBlueprintUpgrade({ fromBlueprint, toBlueprint });
    const additive = isBlueprintUpgradeAdditive(diff);
    const mergePolicyCheck = evaluateBlueprintUpgradeMergePolicy({
        fromBlueprint,
        toBlueprint,
        mergePolicy: DEFAULT_BLUEPRINT_UPGRADE_MERGE_POLICY,
    });
    const certificationValid = verifyBlueprintCertification(toBlueprint);

    return Object.freeze({
        fromVersionId: diff.fromVersionId,
        toVersionId: diff.toVersionId,
        addedCount: diff.added.length,
        changedCount: diff.changed.length,
        removedCount: diff.removed.length,
        additive,
        mergePolicyPassed: mergePolicyCheck.ok,
        disallowedPathCount: mergePolicyCheck.disallowedPaths.length,
        certificationValid,
        canApply: additive && mergePolicyCheck.ok && certificationValid,
        fromBlueprint,
        toBlueprint,
    });
}

export async function applyBlueprintUpgradeFromCatalog({
    dispatcher,
    projectBootstrap,
    targetBlueprintVersionId,
} = {}) {
    const preview = previewBlueprintUpgradeFromCatalog({
        projectBootstrap,
        targetBlueprintVersionId,
    });
    if (!preview.canApply) {
        throw new Error('Upgrade preview failed checks; apply is blocked.');
    }
    const result = await applyBlueprintUpgrade({
        dispatcher,
        fromBlueprint: preview.fromBlueprint,
        toBlueprint: preview.toBlueprint,
    });
    return Object.freeze({
        ...result,
        preview: {
            fromVersionId: preview.fromVersionId,
            toVersionId: preview.toVersionId,
            addedCount: preview.addedCount,
            changedCount: preview.changedCount,
            removedCount: preview.removedCount,
        },
    });
}
