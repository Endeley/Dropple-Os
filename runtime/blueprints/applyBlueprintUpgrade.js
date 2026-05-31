import { diffBlueprintUpgrade } from './diffBlueprintUpgrade.js';

function validateUpgradeInput({ dispatcher, fromBlueprint, toBlueprint }) {
    if (!dispatcher || typeof dispatcher.dispatch !== 'function') {
        throw new Error('applyBlueprintUpgrade: dispatcher with dispatch(event) is required');
    }
    if (!fromBlueprint || !toBlueprint) {
        throw new Error('applyBlueprintUpgrade: fromBlueprint and toBlueprint are required');
    }
}

function assertLineageUpgradePath(fromBlueprint, toBlueprint) {
    const fromVersionId = fromBlueprint?.lineage?.versionId ?? null;
    const toParentVersionId = toBlueprint?.lineage?.parentVersionId ?? null;
    const sameRoot = fromBlueprint?.lineage?.rootId === toBlueprint?.lineage?.rootId;

    if (!sameRoot) {
        throw new Error('applyBlueprintUpgrade: blueprint lineage root mismatch');
    }
    if (fromVersionId == null || toParentVersionId == null || fromVersionId !== toParentVersionId) {
        throw new Error('applyBlueprintUpgrade: blueprint upgrade must reference fromBlueprint lineage version as parent');
    }
}

function assertNoOverwrite(diff) {
    if ((diff.removed?.length ?? 0) > 0 || (diff.changed?.length ?? 0) > 0) {
        throw new Error('applyBlueprintUpgrade: upgrade must be additive (diff/merge only, no overwrite)');
    }
}

export async function applyBlueprintUpgrade({ dispatcher, fromBlueprint, toBlueprint }) {
    validateUpgradeInput({ dispatcher, fromBlueprint, toBlueprint });
    assertLineageUpgradePath(fromBlueprint, toBlueprint);

    const diff = diffBlueprintUpgrade({ fromBlueprint, toBlueprint });
    assertNoOverwrite(diff);

    const appliedEvents = [];
    for (const entry of diff.added) {
        const event = {
            type: entry.event.type,
            payload: entry.event.payload ?? {},
        };
        await dispatcher.dispatch(event);
        appliedEvents.push(event);
    }

    return Object.freeze({
        fromVersionId: diff.fromVersionId,
        toVersionId: diff.toVersionId,
        hasChanges: diff.hasChanges,
        appliedEvents: Object.freeze(appliedEvents),
        addedCount: diff.added.length,
    });
}
