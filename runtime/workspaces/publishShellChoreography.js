function normalizeAssistantState(value) {
    return value === 'engaged' || value === 'ready' ? value : 'idle';
}

function normalizeEntryId(value) {
    return value === 'review' ||
        value === 'versioning' ||
        value === 'conversion' ||
        value === 'components' ||
        value === 'themes' ||
        value === 'variants' ||
        value === 'tokens'
        ? value
        : 'governance';
}

function resolveFocusState(entryId) {
    if (entryId === 'review' || entryId === 'versioning') return 'release';
    if (entryId === 'conversion') return 'delivery';
    if (entryId === 'components' || entryId === 'themes' || entryId === 'variants' || entryId === 'tokens') return 'system';
    return 'governance';
}

function resolveFocusSummary(focusState) {
    if (focusState === 'release') {
        return 'Publish is emphasizing release coordination and review completion.';
    }
    if (focusState === 'delivery') {
        return 'Publish is emphasizing delivery flow and export readiness.';
    }
    if (focusState === 'system') {
        return 'Publish is emphasizing system publication and design-surface coherence.';
    }
    return 'Publish is emphasizing governance, policy, and release authority.';
}

export function resolvePublishShellChoreography({
    activeEntryId = 'governance',
    hasWorkflow = false,
    hasUniverseAnchor = false,
    assistantState = 'idle',
} = {}) {
    const normalizedEntryId = normalizeEntryId(activeEntryId);
    const normalizedAssistantState = normalizeAssistantState(assistantState);
    const focusState = resolveFocusState(normalizedEntryId);
    const dominantContext =
        normalizedAssistantState === 'engaged'
            ? 'assistant'
            : hasWorkflow
              ? 'workflow'
              : hasUniverseAnchor
                ? 'anchor'
                : 'project';

    const roomState =
        dominantContext === 'assistant'
            ? 'guidance-engaged'
            : dominantContext === 'workflow'
              ? 'workflow-leading'
              : dominantContext === 'anchor'
                ? 'anchor-leading'
                : 'receded';

    const workflowState = hasWorkflow ? (normalizedAssistantState === 'engaged' ? 'yielding' : 'leading') : 'dormant';
    const anchorState = hasUniverseAnchor ? (normalizedAssistantState === 'engaged' ? 'supporting' : 'anchored') : 'floating';
    const assistantSummary =
        normalizedAssistantState === 'engaged'
            ? 'Publishing Assistant is engaged with the active publish flow.'
            : normalizedAssistantState === 'ready'
              ? hasWorkflow
                  ? 'Publishing Assistant is ready while publish workflow leads this room.'
                  : 'Publishing Assistant is ready to help the current Publish activity.'
              : hasWorkflow
                ? 'Publishing Assistant stays quiet while publish flow stays primary.'
                : 'Publishing Assistant stays quiet until publish context deepens.';

    return Object.freeze({
        dominantContext,
        roomState,
        workflowState,
        anchorState,
        assistantState: normalizedAssistantState,
        assistantSummary,
        focusState,
        focusSummary: resolveFocusSummary(focusState),
    });
}
