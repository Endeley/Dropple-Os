import {
    compareToolSemanticPrecedence,
    normalizeMergedStringArray,
    normalizeToolOwnerIds,
    resolveToolSemanticConflict,
} from '@/runtime/tools/toolSemanticPolicy.js';

function normalizeToolId(toolId) {
    return typeof toolId === 'string' ? toolId.trim() : '';
}

function resolveCurrentTimeMs(currentTimeMs) {
    return Number.isFinite(currentTimeMs) ? currentTimeMs : 0;
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

function mergeDescriptorTopics(entries, field) {
    return normalizeMergedStringArray(
        (Array.isArray(entries) ? entries : []).flatMap((entry) =>
            Array.isArray(entry?.descriptor?.[field]) ? entry.descriptor[field] : [],
        ),
    );
}

function resolveProjectedDescriptor(winner, entries) {
    if (!winner || typeof winner !== 'object') return null;

    return Object.freeze({
        ...winner,
        intentTopics: mergeDescriptorTopics(entries, 'intentTopics'),
        capabilityTags: mergeDescriptorTopics(entries, 'capabilityTags'),
    });
}

export function resolveToolSemanticWinner({ owners, descriptorsBySource, sourcePriority } = {}) {
    const entries = buildSemanticEntries({ owners, descriptorsBySource, sourcePriority });
    const winnerEntry = entries[0] ?? null;

    return Object.freeze({
        source: winnerEntry?.source ?? null,
        descriptor: resolveProjectedDescriptor(
            entries.find((entry) => entry?.descriptor && typeof entry.descriptor === 'object')?.descriptor ?? null,
            entries,
        ),
        entries: Object.freeze(entries),
    });
}

export function resolveSynthesizedToolProjection({
    toolId,
    owners,
    descriptorsBySource,
    sourcePriority,
    currentTimeMs,
} = {}) {
    const normalizedToolId = normalizeToolId(toolId);
    if (!normalizedToolId) {
        throw new Error('resolveSynthesizedToolProjection requires non-empty toolId');
    }

    const winner = resolveToolSemanticWinner({ owners, descriptorsBySource, sourcePriority });
    const conflict = resolveToolSemanticConflict(winner.entries, {
        toolId: normalizedToolId,
        currentTimeMs: resolveCurrentTimeMs(currentTimeMs),
    });

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
    currentTimeMs,
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
                currentTimeMs,
            }),
        ]);

    return Object.freeze(Object.fromEntries(projections));
}
