function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function listGroupLabels(universe) {
    return Object.values(asObject(universe?.groups) ?? {})
        .filter(Boolean)
        .map((group) => asNonEmptyString(group?.label))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right));
}

function countArtifacts(universe) {
    const hubId = asNonEmptyString(universe?.hubId);
    return Object.keys(asObject(universe?.nodes) ?? {}).filter((nodeId) => nodeId !== hubId).length;
}

function formatExistsSummary(groupLabels, artifactCount) {
    const roomCount = groupLabels.length;
    const lead = roomCount > 0 ? groupLabels.slice(0, 3).join(', ') : 'Project world';
    const suffix = roomCount > 3 ? ` +${roomCount - 3} more` : '';
    return `${lead}${suffix} · ${artifactCount} artifact${artifactCount === 1 ? '' : 's'}`;
}

function resolveBlockedLabel(orientation) {
    const firstDependency = Array.isArray(orientation?.dependencyTargets) ? orientation.dependencyTargets[0] ?? null : null;
    return firstDependency?.label
        ? `Waiting on ${firstDependency.label}`
        : 'No blockers visible';
}

function resolveDoneLabel(orientation) {
    const firstDownstream = Array.isArray(orientation?.downstreamTargets) ? orientation.downstreamTargets[0] ?? null : null;
    return firstDownstream?.label
        ? `Ready for ${firstDownstream.label}`
        : 'Nothing marked done yet';
}

export function buildProjectUniverseAtGlance({
    universe = null,
    orientation = null,
    workflowGuide = null,
} = {}) {
    const groupLabels = Object.freeze(listGroupLabels(universe));
    const artifactCount = countArtifacts(universe);

    return Object.freeze({
        existsLabel: formatExistsSummary(groupLabels, artifactCount),
        activeLabel:
            asNonEmptyString(workflowGuide?.currentTaskLabel) ??
            asNonEmptyString(workflowGuide?.activityLabel) ??
            'Awaiting project focus',
        nextLabel:
            asNonEmptyString(workflowGuide?.primarySuggestionLabel) ??
            'Project Hub',
        blockedLabel: resolveBlockedLabel(orientation),
        doneLabel: resolveDoneLabel(orientation),
        roomCount: groupLabels.length,
        artifactCount,
        visibleRooms: groupLabels,
    });
}
