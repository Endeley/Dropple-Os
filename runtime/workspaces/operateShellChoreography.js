function normalizeAssistantState(value) {
    return value === 'engaged' || value === 'ready' ? value : 'idle';
}

function normalizeEntryId(value) {
    return value === 'systems-engineering' || value === 'enterprise-operations' || value === 'production' || value === 'governance'
        ? value
        : 'automation';
}

function resolveFocusState(entryId) {
    if (entryId === 'systems-engineering') return 'systems';
    if (entryId === 'enterprise-operations') return 'operations';
    if (entryId === 'governance') return 'governance';
    if (entryId === 'production') return 'execution';
    return 'automation';
}

function resolveFocusSummary(focusState) {
    if (focusState === 'systems') {
        return 'Operate is emphasizing system structure and model coherence.';
    }
    if (focusState === 'operations') {
        return 'Operate is emphasizing process flow and enterprise control context.';
    }
    if (focusState === 'governance') {
        return 'Operate is emphasizing rules, oversight, and control boundaries.';
    }
    if (focusState === 'execution') {
        return 'Operate is emphasizing live execution and production readiness.';
    }
    return 'Operate is emphasizing automation flow and downstream system response.';
}

export function resolveOperateShellChoreography({
    activeEntryId = 'automation',
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
            ? 'Operations Assistant is engaged with the active operating flow.'
            : normalizedAssistantState === 'ready'
              ? hasWorkflow
                  ? 'Operations Assistant is ready while operating workflow leads this room.'
                  : 'Operations Assistant is ready to help the current Operate activity.'
              : hasWorkflow
                ? 'Operations Assistant stays quiet while operating flow stays primary.'
                : 'Operations Assistant stays quiet until operating context deepens.';

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
