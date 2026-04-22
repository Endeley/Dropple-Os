import { projectTokenVersionDiff } from './projectTokenVersionDiff.js';
import { topologicalOrderVersions } from './tokenVersionGraph.js';

function createEmptyPreview(leftVersionId = null, rightVersionId = null, commonAncestorId = null) {
    return Object.freeze({
        leftVersionId,
        rightVersionId,
        commonAncestorId,
        incomingChanges: Object.freeze([]),
        overlappingChanges: Object.freeze([]),
        conflicts: Object.freeze([]),
        autoMergeable: Object.freeze([]),
        impactSummary: Object.freeze({
            breaking: 0,
            additive: 0,
            cosmetic: 0,
        }),
    });
}

function stableStringify(value) {
    if (value == null || typeof value !== 'object') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
    }

    const keys = Object.keys(value).sort((left, right) => left.localeCompare(right));
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function impactForKind(kind) {
    if (kind === 'added') return 'additive';
    if (kind === 'removed' || kind === 'alias') return 'breaking';
    return 'cosmetic';
}

function normalizeDiffEntries(diff, side) {
    const entries = [];

    for (const item of diff?.addedTokens ?? []) {
        entries.push(
            Object.freeze({
                side,
                entityKey: item.key,
                kind: 'added',
                label: item.key,
                impact: impactForKind('added'),
                next: item.value,
                details: item,
            }),
        );
    }

    for (const item of diff?.removedTokens ?? []) {
        entries.push(
            Object.freeze({
                side,
                entityKey: item.key,
                kind: 'removed',
                label: item.key,
                impact: impactForKind('removed'),
                next: null,
                details: item,
            }),
        );
    }

    for (const item of diff?.changedValues ?? []) {
        entries.push(
            Object.freeze({
                side,
                entityKey: item.key,
                kind: 'value',
                label: item.key,
                impact: impactForKind('value'),
                next: item.to,
                details: item,
            }),
        );
    }

    for (const item of diff?.changedAliases ?? []) {
        entries.push(
            Object.freeze({
                side,
                entityKey: item.key,
                kind: 'alias',
                label: item.key,
                impact: impactForKind('alias'),
                next: item.to,
                details: item,
            }),
        );
    }

    for (const item of diff?.changedThemeBindings ?? []) {
        entries.push(
            Object.freeze({
                side,
                entityKey: `themeBinding:${item.type}`,
                kind: 'themeBinding',
                label: item.type,
                impact: impactForKind('themeBinding'),
                next: item.to,
                details: item,
            }),
        );
    }

    return entries.sort((left, right) => {
        const entityOrder = left.entityKey.localeCompare(right.entityKey);
        if (entityOrder !== 0) return entityOrder;
        const kindOrder = left.kind.localeCompare(right.kind);
        if (kindOrder !== 0) return kindOrder;
        return left.side.localeCompare(right.side);
    });
}

function ancestorsFor(graph, versionId) {
    const entries = graph?.entries ?? {};
    const result = new Set();
    const stack = [versionId];

    while (stack.length > 0) {
        const currentId = stack.pop();
        if (!currentId || result.has(currentId) || !entries[currentId]) continue;
        result.add(currentId);
        stack.push(...(entries[currentId]?.parentVersionIds ?? []));
    }

    return result;
}

function resolveCommonAncestor(graph, leftVersionId, rightVersionId) {
    if (!leftVersionId || !rightVersionId) return null;
    const topoOrder = topologicalOrderVersions(graph);
    const topoIndex = new Map(topoOrder.map((versionId, index) => [versionId, index]));
    const leftAncestors = ancestorsFor(graph, leftVersionId);
    const rightAncestors = ancestorsFor(graph, rightVersionId);
    const common = Array.from(leftAncestors).filter((versionId) => rightAncestors.has(versionId));

    if (common.length === 0) return null;

    common.sort((left, right) => {
        const leftIndex = topoIndex.get(left) ?? -1;
        const rightIndex = topoIndex.get(right) ?? -1;
        if (leftIndex !== rightIndex) return rightIndex - leftIndex;
        return right.localeCompare(left);
    });

    return common[0] ?? null;
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

function compareNormalizedChanges(leftEntries, rightEntries) {
    const leftByEntity = new Map(leftEntries.map((entry) => [entry.entityKey, entry]));
    const rightByEntity = new Map(rightEntries.map((entry) => [entry.entityKey, entry]));

    const incomingChanges = [];
    const overlappingChanges = [];
    const conflicts = [];
    const autoMergeable = [];

    const allEntities = Array.from(new Set([...leftByEntity.keys(), ...rightByEntity.keys()])).sort((a, b) =>
        a.localeCompare(b),
    );

    for (const entityKey of allEntities) {
        const left = leftByEntity.get(entityKey) ?? null;
        const right = rightByEntity.get(entityKey) ?? null;

        if (!right) {
            continue;
        }

        if (!left) {
            incomingChanges.push(right);
            autoMergeable.push(right);
            continue;
        }

        const leftShape = `${left.kind}:${stableStringify(left.next)}`;
        const rightShape = `${right.kind}:${stableStringify(right.next)}`;
        const overlap = Object.freeze({
            entityKey,
            label: right.label,
            left,
            right,
            impact: right.impact,
        });

        overlappingChanges.push(overlap);

        if (leftShape === rightShape) {
            autoMergeable.push(
                Object.freeze({
                    ...overlap,
                    reason: 'identical-overlap',
                }),
            );
            continue;
        }

        conflicts.push(
            Object.freeze({
                ...overlap,
                reason:
                    left.kind === 'alias' || right.kind === 'alias'
                        ? 'alias-conflict'
                        : left.kind === 'themeBinding' || right.kind === 'themeBinding'
                          ? 'theme-binding-conflict'
                          : 'divergent-edit',
            }),
        );
    }

    return {
        incomingChanges: Object.freeze(incomingChanges),
        overlappingChanges: Object.freeze(overlappingChanges),
        conflicts: Object.freeze(conflicts),
        autoMergeable: Object.freeze(autoMergeable),
    };
}

export function projectTokenMergePreview({
    tokenVersionGraph,
    document,
    events,
    leftVersionId = null,
    rightVersionId = null,
    commonAncestorId = null,
}) {
    const graph = tokenVersionGraph ?? document?.tokenVersions ?? {
        entries: {},
        order: [],
        activeVersionId: null,
    };

    if (!leftVersionId || !rightVersionId || leftVersionId === rightVersionId) {
        return createEmptyPreview(leftVersionId, rightVersionId, commonAncestorId);
    }

    const resolvedCommonAncestorId =
        commonAncestorId ?? resolveCommonAncestor(graph, leftVersionId, rightVersionId);

    if (!resolvedCommonAncestorId) {
        return createEmptyPreview(leftVersionId, rightVersionId, null);
    }

    const leftDiff = projectTokenVersionDiff({
        tokenVersionGraph: graph,
        document,
        events,
        baseVersionId: resolvedCommonAncestorId,
        compareVersionId: leftVersionId,
    });
    const rightDiff = projectTokenVersionDiff({
        tokenVersionGraph: graph,
        document,
        events,
        baseVersionId: resolvedCommonAncestorId,
        compareVersionId: rightVersionId,
    });

    const leftEntries = normalizeDiffEntries(leftDiff, 'left');
    const rightEntries = normalizeDiffEntries(rightDiff, 'right');
    const {
        incomingChanges,
        overlappingChanges,
        conflicts,
        autoMergeable,
    } = compareNormalizedChanges(leftEntries, rightEntries);

    return Object.freeze({
        leftVersionId,
        rightVersionId,
        commonAncestorId: resolvedCommonAncestorId,
        incomingChanges,
        overlappingChanges,
        conflicts,
        autoMergeable,
        impactSummary: Object.freeze(summarizeImpact([...incomingChanges, ...conflicts])),
    });
}

export function hashProjectedTokenMergePreview(projectedPreview) {
    return stableStringify(projectedPreview ?? createEmptyPreview());
}
