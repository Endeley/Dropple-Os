function normalizeAssistantState(value) {
    return value === 'engaged' || value === 'ready' ? value : 'idle';
}

function normalizeEntryId(value) {
    return value === 'automation' || value === 'logic' || value === 'ai' || value === 'conversion' ? value : 'application';
}

function resolveFocusState(entryId) {
    if (entryId === 'automation') return 'execution';
    if (entryId === 'logic') return 'dependency';
    if (entryId === 'ai') return 'execution';
    if (entryId === 'conversion') return 'delivery';
    return 'structure';
}

function resolveFocusSummary(focusState) {
    if (focusState === 'execution') {
        return 'Build is emphasizing execution flow and runnable automation context.';
    }
    if (focusState === 'dependency') {
        return 'Build is emphasizing dependency flow and system logic coherence.';
    }
    if (focusState === 'delivery') {
        return 'Build is emphasizing delivery flow and conversion readiness.';
    }
    return 'Build is emphasizing application structure and connected system shape.';
}

export function resolveBuildShellChoreography({
    activeEntryId = 'application',
    hasWorkflow = false,
    hasOperateHandoff = false,
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
              : hasOperateHandoff
                ? 'handoff'
                : 'project';

    const roomState =
        dominantContext === 'assistant'
            ? 'assistant-engaged'
            : dominantContext === 'workflow'
              ? 'workflow-leading'
              : dominantContext === 'handoff'
                ? 'handoff-ready'
                : 'receded';

    const workflowState = hasWorkflow ? (normalizedAssistantState === 'engaged' ? 'yielding' : 'leading') : 'dormant';
    const handoffState = hasOperateHandoff ? 'ready' : 'idle';
    const assistantSummary =
        normalizedAssistantState === 'engaged'
            ? 'Build Assistant is engaged with the active build flow.'
            : normalizedAssistantState === 'ready'
              ? hasWorkflow
                  ? 'Build Assistant is ready while build workflow leads this room.'
                  : 'Build Assistant is ready to help the current Build activity.'
              : hasWorkflow
                ? 'Build Assistant stays quiet while workflow and dependencies stay primary.'
                : 'Build Assistant stays quiet until build context deepens.';

    return Object.freeze({
        dominantContext,
        roomState,
        workflowState,
        handoffState,
        assistantState: normalizedAssistantState,
        assistantSummary,
        focusState,
        focusSummary: resolveFocusSummary(focusState),
    });
}
