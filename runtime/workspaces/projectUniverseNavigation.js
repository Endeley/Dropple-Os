function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function normalizeProjectUniverseNavigatorQuery(value) {
    const normalized = asNonEmptyString(value);
    return normalized ?? '';
}

export function buildProjectUniverseNavigatorItems({ universe = null, query = '' } = {}) {
    const normalizedQuery = normalizeProjectUniverseNavigatorQuery(query).toLowerCase();
    const groups = Object.values(asObject(universe?.groups) ?? {})
        .filter(Boolean)
        .map((group) =>
            Object.freeze({
                id: group.id,
                targetId: group.id,
                targetType: 'group',
                perspectiveId: group.perspectiveId,
                label: group.label,
                subtitle: `${group.nodeIds.length} artifact${group.nodeIds.length === 1 ? '' : 's'}`,
                x: Number.isFinite(group.x) ? Number(group.x) : 0,
                y: Number.isFinite(group.y) ? Number(group.y) : 0,
            }),
        );
    const nodes = Object.values(asObject(universe?.nodes) ?? {})
        .filter((node) => node.id !== universe?.hubId)
        .map((node) =>
            Object.freeze({
                id: node.id,
                targetId: node.id,
                targetType: 'node',
                perspectiveId: 'artifact',
                label: node.label,
                subtitle: node.kind,
                x: Number.isFinite(node.x) ? Number(node.x) : 0,
                y: Number.isFinite(node.y) ? Number(node.y) : 0,
            }),
        );

    const all = [...groups, ...nodes].sort((left, right) => {
        if (left.targetType !== right.targetType) return left.targetType.localeCompare(right.targetType);
        if (left.perspectiveId !== right.perspectiveId) return left.perspectiveId.localeCompare(right.perspectiveId);
        return left.label.localeCompare(right.label);
    });

    if (!normalizedQuery) return Object.freeze(all);

    return Object.freeze(
        all.filter((item) => {
            const haystack = `${item.label} ${item.subtitle} ${item.perspectiveId}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        }),
    );
}

export function resolveProjectUniverseFocusTarget({ universe = null, targetId = null } = {}) {
    const normalizedTargetId = asNonEmptyString(targetId);
    if (!normalizedTargetId) return null;

    const group = asObject(universe?.groups)?.[normalizedTargetId] ?? null;
    if (group) {
        return Object.freeze({
            id: normalizedTargetId,
            targetType: 'group',
            x: Number.isFinite(group.x) ? Number(group.x) : 0,
            y: Number.isFinite(group.y) ? Number(group.y) : 0,
            scale: 0.6,
        });
    }

    const node = asObject(universe?.nodes)?.[normalizedTargetId] ?? null;
    if (node) {
        return Object.freeze({
            id: normalizedTargetId,
            targetType: 'node',
            x: Number.isFinite(node.x) ? Number(node.x) : 0,
            y: Number.isFinite(node.y) ? Number(node.y) : 0,
            scale: 1.25,
        });
    }

    return null;
}
