function createEmptyResolution() {
    return Object.freeze({
        resolutions: Object.freeze([]),
        unresolvedCount: 0,
        predictedMergedResult: Object.freeze([]),
        impactSummary: Object.freeze({
            breaking: 0,
            additive: 0,
            cosmetic: 0,
        }),
    });
}

function determineConflictType(conflict) {
    const leftKind = conflict?.left?.kind ?? null;
    const rightKind = conflict?.right?.kind ?? null;

    if (leftKind === 'alias' || rightKind === 'alias') {
        return 'ALIAS_CONFLICT';
    }

    if (leftKind === 'themeBinding' || rightKind === 'themeBinding') {
        return 'THEME_BINDING_CONFLICT';
    }

    if (leftKind === 'removed' || rightKind === 'removed') {
        return 'DELETE_MODIFY_CONFLICT';
    }

    return 'VALUE_CONFLICT';
}

function optionsForConflictType(conflictType) {
    switch (conflictType) {
        case 'ALIAS_CONFLICT':
            return Object.freeze(['keep-left', 'keep-right', 'alias-rebind']);
        case 'VALUE_CONFLICT':
            return Object.freeze(['keep-left', 'keep-right', 'manual-merged-value']);
        case 'DELETE_MODIFY_CONFLICT':
        case 'THEME_BINDING_CONFLICT':
        default:
            return Object.freeze(['keep-left', 'keep-right']);
    }
}

function resolveSelection(conflict, selectedChoice) {
    const choice = selectedChoice?.choice ?? null;

    switch (choice) {
        case 'keep-left':
            return {
                isResolved: true,
                source: 'left',
                value: conflict?.left?.next ?? null,
            };
        case 'keep-right':
            return {
                isResolved: true,
                source: 'right',
                value: conflict?.right?.next ?? null,
            };
        case 'manual-merged-value': {
            const manualValue = selectedChoice?.manualValue ?? '';
            if (manualValue === '') {
                return { isResolved: false, source: 'manual', value: null };
            }
            return {
                isResolved: true,
                source: 'manual',
                value: manualValue,
            };
        }
        case 'alias-rebind': {
            const manualTargetPath = selectedChoice?.manualTargetPath ?? '';
            if (manualTargetPath === '') {
                return { isResolved: false, source: 'manual', value: null };
            }
            return {
                isResolved: true,
                source: 'manual',
                value: {
                    type: 'token',
                    value: manualTargetPath,
                },
            };
        }
        default:
            return { isResolved: false, source: null, value: null };
    }
}

function summarizeImpact(entries) {
    return entries.reduce(
        (summary, entry) => ({
            ...summary,
            [entry.impact]: summary[entry.impact] + 1,
        }),
        { breaking: 0, additive: 0, cosmetic: 0 },
    );
}

export function projectTokenConflictResolutions({
    mergePreview,
    selectedResolutionChoices = {},
}) {
    const preview = mergePreview ?? {};
    const conflicts = Array.isArray(preview.conflicts) ? preview.conflicts : [];
    const autoMergeable = Array.isArray(preview.autoMergeable) ? preview.autoMergeable : [];

    if (conflicts.length === 0 && autoMergeable.length === 0) {
        return createEmptyResolution();
    }

    const resolutions = conflicts.map((conflict) => {
        const conflictType = determineConflictType(conflict);
        const selection = selectedResolutionChoices?.[conflict.entityKey] ?? {};
        const resolved = resolveSelection(conflict, selection);

        return Object.freeze({
            entityKey: conflict.entityKey,
            label: conflict.label,
            conflictType,
            options: optionsForConflictType(conflictType),
            selectedChoice: selection.choice ?? null,
            manualValue: selection.manualValue ?? '',
            manualTargetPath: selection.manualTargetPath ?? '',
            left: conflict.left,
            right: conflict.right,
            impact: conflict.impact,
            isResolved: resolved.isResolved,
            resolvedSource: resolved.source,
            resolvedValue: resolved.value,
        });
    });

    const predictedMergedResult = Object.freeze([
        ...autoMergeable.map((entry) =>
            Object.freeze({
                entityKey: entry.entityKey,
                label: entry.label,
                source: entry.right?.side ?? 'right',
                value: entry.right?.next ?? null,
                impact: entry.impact,
            }),
        ),
        ...resolutions
            .filter((entry) => entry.isResolved)
            .map((entry) =>
                Object.freeze({
                    entityKey: entry.entityKey,
                    label: entry.label,
                    source: entry.resolvedSource,
                    value: entry.resolvedValue,
                    impact: entry.impact,
                }),
            ),
    ].sort((left, right) => left.entityKey.localeCompare(right.entityKey)));

    return Object.freeze({
        resolutions: Object.freeze(resolutions),
        unresolvedCount: resolutions.filter((entry) => !entry.isResolved).length,
        predictedMergedResult,
        impactSummary: Object.freeze(summarizeImpact(predictedMergedResult)),
    });
}
