import { installBlueprint } from '@/runtime/blueprints/installBlueprint.js';
import {
    listBlueprintCatalog,
    resolveBlueprintFromCatalogByVersionId,
} from '@/runtime/blueprints/blueprintCatalog.js';
import { resolveBlueprintCatalogEntry } from '@/runtime/blueprints/resolveBlueprintCatalogEntry.js';
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
