import {
    compareToolSemanticPrecedence,
    normalizeToolOwnerIds,
    resolveToolSemanticConflict,
} from '@/runtime/tools/toolSemanticPolicy.js';

function normalizeToolId(toolId) {
    return typeof toolId === 'string' ? toolId.trim() : '';
}

function buildSemanticEntries({ owners, descriptorsBySource, sourcePriority }) {
    return normalizeToolOwnerIds(owners)
        .map((source) =>
            Object.freeze({
                source,
                priority: Number.isFinite(sourcePriority?.[source]) ? sourcePriority[source] : 0,
                descriptor: descriptorsBySource?.[source] ?? null,
            }),
        )
        .sort((left, right) =>
            compareToolSemanticPrecedence(left.source, right.source, sourcePriority),
        );
}

export function resolveToolSemanticWinner({ owners, descriptorsBySource, sourcePriority } = {}) {
    const entries = buildSemanticEntries({ owners, descriptorsBySource, sourcePriority });
    const winnerEntry = entries[0] ?? null;

    return Object.freeze({
        source: winnerEntry?.source ?? null,
        descriptor:
            entries.find((entry) => entry?.descriptor && typeof entry.descriptor === 'object')?.descriptor ?? null,
        entries: Object.freeze(entries),
    });
}

export function resolveSynthesizedToolProjection({
    toolId,
    owners,
    descriptorsBySource,
    sourcePriority,
} = {}) {
    const normalizedToolId = normalizeToolId(toolId);
    if (!normalizedToolId) {
        throw new Error('resolveSynthesizedToolProjection requires non-empty toolId');
    }

    const winner = resolveToolSemanticWinner({ owners, descriptorsBySource, sourcePriority });
    const conflict = resolveToolSemanticConflict(winner.entries);

    if (conflict) {
        return Object.freeze({
            id: normalizedToolId,
            owners: Object.freeze(winner.entries.map((entry) => entry.source)),
            winnerSource: null,
            winnerPriority: null,
            descriptor: null,
            status: 'invalid',
            invalidReason: conflict.message,
            invalidCode: conflict.code,
        });
    }

    return Object.freeze({
        id: normalizedToolId,
        owners: Object.freeze(winner.entries.map((entry) => entry.source)),
        winnerSource: winner.source,
        winnerPriority: winner.entries[0]?.priority ?? 0,
        descriptor: winner.descriptor,
        status: 'valid',
        invalidReason: null,
        invalidCode: null,
    });
}

export function resolveSynthesizedToolProjectionMap({
    ownership,
    registeredToolDescriptors,
    sourcePriority,
} = {}) {
    const projections = Object.entries(ownership ?? {})
        .sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
        .map(([toolId, owners]) => [
            toolId,
            resolveSynthesizedToolProjection({
                toolId,
                owners,
                descriptorsBySource: Object.freeze(
                    Object.fromEntries(
                        normalizeToolOwnerIds(owners).map((source) => [
                            source,
                            registeredToolDescriptors?.[source]?.[toolId] ?? null,
                        ]),
                    ),
                ),
                sourcePriority,
            }),
        ]);

    return Object.freeze(Object.fromEntries(projections));
}
