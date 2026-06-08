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

function buildUniverseItemMaps(universe = null) {
    const items = buildProjectUniverseNavigatorItems({ universe, query: '' });
    const byTargetId = new Map(items.map((item) => [item.targetId, item]));
    return Object.freeze({
        items,
        byTargetId,
    });
}

function dedupeTargets(items) {
    const seen = new Set();
    const next = [];
    for (const item of items) {
        if (!item || typeof item.targetId !== 'string' || seen.has(item.targetId)) continue;
        seen.add(item.targetId);
        next.push(item);
    }
    return Object.freeze(next);
}

function asNavigatorItem(item) {
    if (!item) return null;
    return Object.freeze({
        id: item.id,
        targetId: item.targetId,
        targetType: item.targetType,
        perspectiveId: item.perspectiveId,
        label: item.label,
        subtitle: item.subtitle,
        relationshipType: asNonEmptyString(item.relationshipType),
        relationshipSummary: asNonEmptyString(item.relationshipSummary),
        relationshipPriority: Number.isFinite(item.relationshipPriority) ? Number(item.relationshipPriority) : 0,
        priorityTier: asNonEmptyString(item.priorityTier),
        prioritySummary: asNonEmptyString(item.prioritySummary),
        x: Number.isFinite(item.x) ? Number(item.x) : 0,
        y: Number.isFinite(item.y) ? Number(item.y) : 0,
    });
}

function compareNavigatorTargetsByPriority(left, right) {
    const leftPriority = Number.isFinite(left?.relationshipPriority) ? Number(left.relationshipPriority) : 0;
    const rightPriority = Number.isFinite(right?.relationshipPriority) ? Number(right.relationshipPriority) : 0;
    if (leftPriority !== rightPriority) return rightPriority - leftPriority;

    const targetPriority = { node: 0, group: 1, hub: 2 };
    const leftType = targetPriority[left?.targetType] ?? 99;
    const rightType = targetPriority[right?.targetType] ?? 99;
    if (leftType !== rightType) return leftType - rightType;

    const leftLabel = asNonEmptyString(left?.label) ?? '';
    const rightLabel = asNonEmptyString(right?.label) ?? '';
    return leftLabel.localeCompare(rightLabel);
}

function sortTargetsByPriority(items) {
    return Object.freeze([...(Array.isArray(items) ? items : [])].sort(compareNavigatorTargetsByPriority));
}

function isDependencyRelationship(type) {
    return (
        type === 'depends-on' ||
        type === 'documents' ||
        type === 'styles' ||
        type === 'components-for'
    );
}

function isDownstreamRelationship(type) {
    return (
        type === 'produces' ||
        type === 'publishes' ||
        type === 'operates' ||
        type === 'reviews'
    );
}

function resolveRelationshipPriority(type) {
    switch (type) {
        case 'depends-on':
            return 100;
        case 'operates':
            return 90;
        case 'produces':
            return 80;
        case 'publishes':
            return 70;
        case 'reviews':
            return 60;
        case 'documents':
            return 50;
        case 'components-for':
            return 40;
        case 'styles':
            return 30;
        default:
            return 10;
    }
}

function resolveRelationshipPriorityTier(priority) {
    if (priority >= 90) return 'primary';
    if (priority >= 70) return 'supporting';
    return 'adjacent';
}

function attachRelationship(item, relationship) {
    if (!item || !relationship) return asNavigatorItem(item);
    const relationshipPriority = Number.isFinite(relationship.priority)
        ? Number(relationship.priority)
        : resolveRelationshipPriority(relationship.type);
    return Object.freeze({
        ...asNavigatorItem(item),
        relationshipType: asNonEmptyString(relationship.type),
        relationshipSummary: asNonEmptyString(relationship.summary),
        relationshipPriority,
        priorityTier: asNonEmptyString(relationship.priorityTier) ?? resolveRelationshipPriorityTier(relationshipPriority),
        prioritySummary: `Priority path: ${asNonEmptyString(relationship.summary) ?? 'project context'}`,
    });
}

function resolveTargetLabel(item, fallback) {
    return asNonEmptyString(item?.label) ?? fallback;
}

export function buildProjectUniverseNavigatorItems({ universe = null, query = '' } = {}) {
    const normalizedQuery = normalizeProjectUniverseNavigatorQuery(query).toLowerCase();
    const hubNode = asObject(universe?.nodes)?.[universe?.hubId] ?? null;
    const hub = hubNode
        ? [
              Object.freeze({
                  id: hubNode.id,
                  targetId: hubNode.id,
                  targetType: 'hub',
                  perspectiveId: 'project',
                  label: hubNode.label,
                  subtitle: 'project universe anchor',
                  x: Number.isFinite(hubNode.x) ? Number(hubNode.x) : 0,
                  y: Number.isFinite(hubNode.y) ? Number(hubNode.y) : 0,
              }),
          ]
        : [];
    const groups = Object.values(asObject(universe?.groups) ?? {})
        .filter(Boolean)
        .map((group) =>
            Object.freeze({
                id: group.id,
                targetId: group.id,
                targetType: 'group',
                perspectiveId: group.perspectiveId,
                label: group.label,
                subtitle:
                    typeof group?.metadata?.primaryNodeLabel === 'string' && group.metadata.primaryNodeLabel.trim().length > 0
                        ? `${group.nodeIds.length} artifact${group.nodeIds.length === 1 ? '' : 's'} · ${group.metadata.primaryNodeLabel}${typeof group?.metadata?.prioritySummary === 'string' && group.metadata.prioritySummary.trim().length > 0 ? ` · ${group.metadata.prioritySummary}` : typeof group?.metadata?.relationshipSummary === 'string' && group.metadata.relationshipSummary.trim().length > 0 ? ` · ${group.metadata.relationshipSummary}` : ''}`
                        : `${group.nodeIds.length} artifact${group.nodeIds.length === 1 ? '' : 's'}${typeof group?.metadata?.prioritySummary === 'string' && group.metadata.prioritySummary.trim().length > 0 ? ` · ${group.metadata.prioritySummary}` : typeof group?.metadata?.relationshipSummary === 'string' && group.metadata.relationshipSummary.trim().length > 0 ? ` · ${group.metadata.relationshipSummary}` : ''}`,
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

    const all = [...hub, ...groups, ...nodes].sort((left, right) => {
        if (left.targetType !== right.targetType) {
            const priority = { hub: 0, group: 1, node: 2 };
            return (priority[left.targetType] ?? 99) - (priority[right.targetType] ?? 99);
        }
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

export function buildProjectUniverseOrientation({ universe = null, targetId = null, query = '' } = {}) {
    const { items, byTargetId } = buildUniverseItemMaps(universe);
    const normalizedTargetId = asNonEmptyString(targetId) ?? asNonEmptyString(universe?.hubId);
    const current = asNavigatorItem(normalizedTargetId ? byTargetId.get(normalizedTargetId) ?? null : null);
    if (!current) return null;

    const hubId = asNonEmptyString(universe?.hubId);
    const group = asObject(universe?.groups)?.[current.targetId] ?? null;
    const node = asObject(universe?.nodes)?.[current.targetId] ?? null;
    const ownerGroup = current.targetType === 'node'
        ? Object.values(asObject(universe?.groups) ?? {}).find((candidate) => Array.isArray(candidate?.nodeIds) && candidate.nodeIds.includes(current.targetId)) ?? null
        : null;

    const returnTarget =
        current.targetType === 'node'
            ? asNavigatorItem(ownerGroup ? byTargetId.get(ownerGroup.id) ?? null : hubId ? byTargetId.get(hubId) ?? null : null)
            : current.targetType === 'group'
                ? asNavigatorItem(hubId ? byTargetId.get(hubId) ?? null : null)
                : null;

    const relationshipEdges =
        current.targetType === 'group'
            ? Array.isArray(group?.metadata?.relationshipEdges)
                ? group.metadata.relationshipEdges
                : []
            : current.targetType === 'node'
                ? Array.isArray(node?.metadata?.relationshipEdges)
                    ? node.metadata.relationshipEdges
                    : []
                : [];

    const relatedTargets = dedupeTargets(sortTargetsByPriority(
        relationshipEdges
            .map((edge) => {
                const targetId = asNonEmptyString(edge?.targetNodeId) ?? asNonEmptyString(edge?.targetGroupId);
                return attachRelationship(byTargetId.get(targetId) ?? null, edge);
            })
            .filter(Boolean),
    ));
    const dependencyTargets = dedupeTargets(
        sortTargetsByPriority(relatedTargets.filter((item) => isDependencyRelationship(item.relationshipType))),
    );
    const downstreamTargets = dedupeTargets(
        sortTargetsByPriority(relatedTargets.filter((item) => isDownstreamRelationship(item.relationshipType))),
    );

    const siblingTargets = dedupeTargets(
        current.targetType === 'node' && ownerGroup
            ? (ownerGroup.nodeIds ?? [])
                  .filter((id) => id !== current.targetId)
                  .map((id) => asNavigatorItem(byTargetId.get(id) ?? null))
                  .filter(Boolean)
            : current.targetType === 'group'
                ? items
                      .filter((item) => item.targetType === 'group' && item.targetId !== current.targetId)
                      .map((item) => asNavigatorItem(item))
                : [],
    );

    const normalizedQuery = normalizeProjectUniverseNavigatorQuery(query).toLowerCase();
    const matchedTargets =
        normalizedQuery.length > 0
            ? dedupeTargets(
                  items
                      .filter((item) => {
                          const haystack = `${item.label} ${item.subtitle} ${item.perspectiveId}`.toLowerCase();
                          return haystack.includes(normalizedQuery) && item.targetId !== current.targetId;
                      })
                      .map((item) => asNavigatorItem(item)),
              )
            : Object.freeze([]);
    const flowTargets = dedupeTargets(sortTargetsByPriority(
        matchedTargets.length > 0
            ? [...dependencyTargets, ...downstreamTargets, ...matchedTargets]
            : [...dependencyTargets, ...downstreamTargets, ...siblingTargets],
    ));
    const priorityTargets = flowTargets.filter((item) => item.targetId !== current.targetId);
    const nextTargets = matchedTargets.length > 0 ? matchedTargets : priorityTargets.length > 0 ? priorityTargets : siblingTargets;

    return Object.freeze({
        current,
        returnTarget,
        relatedTargets,
        dependencyTargets,
        downstreamTargets,
        siblingTargets,
        matchedTargets,
        nextTargets,
        flowTargets,
        priorityTargets,
    });
}

export function buildProjectUniverseAnchoringSummary({ orientation = null, workflowGuide = null } = {}) {
    if (!orientation?.current) return null;

    const relatedCount = Array.isArray(orientation.relatedTargets) ? orientation.relatedTargets.length : 0;
    const upstreamCount = Array.isArray(orientation.dependencyTargets) ? orientation.dependencyTargets.length : 0;
    const downstreamCount = Array.isArray(orientation.downstreamTargets) ? orientation.downstreamTargets.length : 0;
    const nextLabel =
        resolveTargetLabel(workflowGuide?.suggestions?.[0], null) ??
        resolveTargetLabel(orientation.nextTargets?.[0], null) ??
        resolveTargetLabel(orientation.returnTarget, 'Project Hub');

    return Object.freeze({
        focusLabel: resolveTargetLabel(orientation.current, 'Project Hub'),
        returnLabel: resolveTargetLabel(orientation.returnTarget, 'Project Hub'),
        relatedCount,
        upstreamCount,
        downstreamCount,
        nextLabel: nextLabel ?? 'Project Hub',
    });
}

export function resolveProjectUniverseFocusTarget({ universe = null, targetId = null } = {}) {
    const normalizedTargetId = asNonEmptyString(targetId);
    if (!normalizedTargetId) return null;

    const hubId = asNonEmptyString(universe?.hubId);
    const hubNode = hubId ? asObject(universe?.nodes)?.[hubId] ?? null : null;
    if (hubNode && normalizedTargetId === hubId) {
        return Object.freeze({
            id: normalizedTargetId,
            targetType: 'hub',
            x: Number.isFinite(hubNode.x) ? Number(hubNode.x) : 0,
            y: Number.isFinite(hubNode.y) ? Number(hubNode.y) : 0,
            scale: 1,
        });
    }

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
