function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function buildPerspectiveHref({ perspectiveId, entryId, targetId = null }) {
    const searchParams = new URLSearchParams();
    if (entryId) searchParams.set('entry', entryId);
    if (targetId) searchParams.set('u', targetId);
    return `/workspace/${perspectiveId}?${searchParams.toString()}`;
}

function createSuggestion({
    id,
    label,
    reason,
    href,
    targetId = null,
    perspectiveId,
    entryId = null,
    source = null,
}) {
    const normalizedId = asNonEmptyString(id);
    const normalizedLabel = asNonEmptyString(label);
    const normalizedReason = asNonEmptyString(reason);
    const normalizedHref = asNonEmptyString(href);
    const normalizedPerspectiveId = asNonEmptyString(perspectiveId);
    if (!normalizedId || !normalizedLabel || !normalizedReason || !normalizedHref || !normalizedPerspectiveId) {
        return null;
    }

    return Object.freeze({
        id: normalizedId,
        label: normalizedLabel,
        reason: normalizedReason,
        href: normalizedHref,
        targetId: asNonEmptyString(targetId),
        perspectiveId: normalizedPerspectiveId,
        entryId: asNonEmptyString(entryId),
        source: asNonEmptyString(source) ?? 'workflow',
    });
}

function appendSuggestion(suggestions, seen, suggestion) {
    if (!suggestion) return;
    const key = suggestion.targetId ? `target:${suggestion.targetId}` : `href:${suggestion.href}`;
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push(suggestion);
}

function resolveCurrentSummary({
    perspectiveId,
    createWorkflow,
    buildWorkflow,
    collaborateWorkflow,
    operateWorldSummary,
    publishWorldSummary,
}) {
    if (perspectiveId === 'create') return createWorkflow?.worldSummary ?? null;
    if (perspectiveId === 'build') return buildWorkflow?.worldSummary ?? null;
    if (perspectiveId === 'collaborate') return collaborateWorkflow?.worldSummary ?? null;
    if (perspectiveId === 'operate') return operateWorldSummary ?? null;
    if (perspectiveId === 'publish') return publishWorldSummary ?? null;
    return null;
}

function buildFallbackOrientationSuggestions({ suggestions, seen, orientation, perspectiveId, entryId }) {
    const dependencyTargets = Array.isArray(orientation?.dependencyTargets) ? orientation.dependencyTargets : [];
    const downstreamTargets = Array.isArray(orientation?.downstreamTargets) ? orientation.downstreamTargets : [];

    for (const item of dependencyTargets) {
        appendSuggestion(
            suggestions,
            seen,
            createSuggestion({
                id: `orientation:dependency:${item.targetId}`,
                label: item.label,
                reason: item.relationshipSummary ?? 'Resolve upstream dependency context from the current project world.',
                href: buildPerspectiveHref({ perspectiveId, entryId, targetId: item.targetId }),
                targetId: item.targetId,
                perspectiveId,
                entryId,
                source: 'orientation',
            }),
        );
    }

    for (const item of downstreamTargets) {
        appendSuggestion(
            suggestions,
            seen,
            createSuggestion({
                id: `orientation:downstream:${item.targetId}`,
                label: item.label,
                reason: item.relationshipSummary ?? 'Move into downstream project flow from the current focus.',
                href: buildPerspectiveHref({ perspectiveId, entryId, targetId: item.targetId }),
                targetId: item.targetId,
                perspectiveId,
                entryId,
                source: 'orientation',
            }),
        );
    }

    for (const item of orientation?.nextTargets ?? []) {
        appendSuggestion(
            suggestions,
            seen,
            createSuggestion({
                id: `orientation:next:${item.targetId}`,
                label: item.label,
                reason: 'Next likely focus from the current project world.',
                href: buildPerspectiveHref({ perspectiveId, entryId, targetId: item.targetId }),
                targetId: item.targetId,
                perspectiveId,
                entryId,
                source: 'orientation',
            }),
        );
    }
}

function buildPriorityOrientationSuggestions({ suggestions, seen, orientation, perspectiveId, entryId }) {
    for (const item of orientation?.priorityTargets ?? []) {
        const targetPerspectiveId =
            item.targetType === 'group' && asNonEmptyString(item.perspectiveId)
                ? item.perspectiveId
                : perspectiveId;

        appendSuggestion(
            suggestions,
            seen,
            createSuggestion({
                id: `orientation:priority:${item.targetId}`,
                label: item.label,
                reason: item.prioritySummary ?? item.relationshipSummary ?? 'Priority path from the current project world.',
                href: buildPerspectiveHref({
                    perspectiveId: targetPerspectiveId,
                    entryId: targetPerspectiveId === perspectiveId ? entryId : null,
                    targetId: item.targetId,
                }),
                targetId: item.targetId,
                perspectiveId: targetPerspectiveId,
                entryId: targetPerspectiveId === perspectiveId ? entryId : null,
                source: 'priority',
            }),
        );
    }
}

export function buildProjectUniverseWorkflowGuide({
    perspectiveId,
    entryId,
    orientation = null,
    createWorkflow = null,
    buildWorkflow = null,
    collaborateWorkflow = null,
    operateWorldSummary = null,
    publishWorldSummary = null,
} = {}) {
    const normalizedPerspectiveId = asNonEmptyString(perspectiveId) ?? 'create';
    const normalizedEntryId = asNonEmptyString(entryId) ?? null;
    const currentSummary = resolveCurrentSummary({
        perspectiveId: normalizedPerspectiveId,
        createWorkflow,
        buildWorkflow,
        collaborateWorkflow,
        operateWorldSummary,
        publishWorldSummary,
    });

    const suggestions = [];
    const seen = new Set();

    buildPriorityOrientationSuggestions({
        suggestions,
        seen,
        orientation,
        perspectiveId: normalizedPerspectiveId,
        entryId: normalizedEntryId,
    });

    if (normalizedPerspectiveId === 'create') {
        appendSuggestion(
            suggestions,
            seen,
            createSuggestion({
                id: `create:next:${createWorkflow?.suggestedNextArtifact?.targetId ?? 'none'}`,
                label: createWorkflow?.suggestedNextArtifact?.label,
                reason: 'Continue the next create artifact connected to this project focus.',
                href: createWorkflow?.suggestedNextArtifact?.href,
                targetId: createWorkflow?.suggestedNextArtifact?.targetId,
                perspectiveId: 'create',
                entryId: createWorkflow?.suggestedNextArtifact?.entryId,
                source: 'workflow',
            }),
        );
    }

    if (normalizedPerspectiveId === 'build') {
        appendSuggestion(
            suggestions,
            seen,
            createSuggestion({
                id: `build:next:${buildWorkflow?.suggestedNextArtifact?.targetId ?? 'none'}`,
                label: buildWorkflow?.suggestedNextArtifact?.label,
                reason: 'Continue the next build artifact in the current system flow.',
                href: buildWorkflow?.suggestedNextArtifact?.href,
                targetId: buildWorkflow?.suggestedNextArtifact?.targetId,
                perspectiveId: 'build',
                entryId: buildWorkflow?.suggestedNextArtifact?.entryId,
                source: 'workflow',
            }),
        );
        appendSuggestion(
            suggestions,
            seen,
            createSuggestion({
                id: `build:operate:${buildWorkflow?.operateHandoff?.entryId ?? 'none'}`,
                label: buildWorkflow?.operateHandoff?.label,
                reason: 'Move from build planning into live operating context.',
                href: buildWorkflow?.operateHandoff?.href,
                perspectiveId: 'operate',
                entryId: buildWorkflow?.operateHandoff?.entryId,
                source: 'workflow',
            }),
        );
    }

    if (normalizedPerspectiveId === 'collaborate') {
        appendSuggestion(
            suggestions,
            seen,
            createSuggestion({
                id: `collaborate:next:${collaborateWorkflow?.suggestedNextArtifact?.targetId ?? 'none'}`,
                label: collaborateWorkflow?.suggestedNextArtifact?.label,
                reason: 'Continue the next collaboration artifact linked to the current review flow.',
                href: collaborateWorkflow?.suggestedNextArtifact?.href,
                targetId: collaborateWorkflow?.suggestedNextArtifact?.targetId,
                perspectiveId: 'collaborate',
                entryId: collaborateWorkflow?.suggestedNextArtifact?.entryId,
                source: 'workflow',
            }),
        );
        appendSuggestion(
            suggestions,
            seen,
            createSuggestion({
                id: `collaborate:publish:${collaborateWorkflow?.publishHandoff?.entryId ?? 'none'}`,
                label: collaborateWorkflow?.publishHandoff?.label,
                reason: 'Carry collaboration output into publish review.',
                href: collaborateWorkflow?.publishHandoff?.href,
                perspectiveId: 'publish',
                entryId: collaborateWorkflow?.publishHandoff?.entryId,
                source: 'workflow',
            }),
        );
    }

    if (normalizedPerspectiveId === 'operate') {
        for (const item of orientation?.relatedTargets ?? []) {
            appendSuggestion(
                suggestions,
                seen,
                createSuggestion({
                    id: `operate:related:${item.targetId}`,
                    label: item.label,
                    reason: 'Inspect the related system context around the current operating focus.',
                    href: buildPerspectiveHref({
                        perspectiveId: 'operate',
                        entryId: normalizedEntryId ?? 'automation',
                        targetId: item.targetId,
                    }),
                    targetId: item.targetId,
                    perspectiveId: 'operate',
                    entryId: normalizedEntryId ?? 'automation',
                    source: 'workflow',
                }),
            );
        }
    }

    if (normalizedPerspectiveId === 'publish') {
        if (orientation?.returnTarget) {
            appendSuggestion(
                suggestions,
                seen,
                createSuggestion({
                    id: `publish:return:${orientation.returnTarget.targetId}`,
                    label: orientation.returnTarget.label,
                    reason: 'Surface back to the source context before closing the release loop.',
                    href: buildPerspectiveHref({
                        perspectiveId: 'publish',
                        entryId: normalizedEntryId ?? 'governance',
                        targetId: orientation.returnTarget.targetId,
                    }),
                    targetId: orientation.returnTarget.targetId,
                    perspectiveId: 'publish',
                    entryId: normalizedEntryId ?? 'governance',
                    source: 'workflow',
                }),
            );
        }
    }

    buildFallbackOrientationSuggestions({
        suggestions,
        seen,
        orientation,
        perspectiveId: normalizedPerspectiveId,
        entryId: normalizedEntryId,
    });

    return Object.freeze({
        activityLabel: asNonEmptyString(currentSummary?.activityLabel) ?? 'Project Workflow',
        currentTaskLabel:
            asNonEmptyString(currentSummary?.currentTaskLabel) ??
            asNonEmptyString(currentSummary?.activeArtifactLabel) ??
            'Awaiting project workflow context',
        summaryLabel:
            asNonEmptyString(currentSummary?.summaryLabel) ??
            asNonEmptyString(currentSummary?.nextArtifactLabel) ??
            `${suggestions.length} guided next work item${suggestions.length === 1 ? '' : 's'}`,
        primarySuggestionLabel: asNonEmptyString(suggestions[0]?.label) ?? 'Project Hub',
        primarySuggestionReason: asNonEmptyString(suggestions[0]?.reason) ?? 'Awaiting project workflow context',
        suggestions: Object.freeze(suggestions.slice(0, 4)),
    });
}
