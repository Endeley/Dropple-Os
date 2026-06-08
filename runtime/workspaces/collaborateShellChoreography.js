function normalizeAssistantState(value) {
    return value === 'engaged' || value === 'ready' ? value : 'idle';
}

function normalizeEntryId(value) {
    return value === 'production' || value === 'knowledge' || value === 'education' ? value : 'review';
}

function resolveFocusState(entryId) {
    if (entryId === 'production') return 'production';
    if (entryId === 'knowledge') return 'knowledge';
    if (entryId === 'education') return 'learning';
    return 'review';
}

function resolveFocusSummary(focusState) {
    if (focusState === 'production') {
        return 'Collaborate is emphasizing production flow and coordinated delivery.';
    }
    if (focusState === 'knowledge') {
        return 'Collaborate is emphasizing shared knowledge and durable team context.';
    }
    if (focusState === 'learning') {
        return 'Collaborate is emphasizing learning flow and guided understanding.';
    }
    return 'Collaborate is emphasizing review flow and coordinated decision-making.';
}

export function resolveCollaborateShellChoreography({
    activeEntryId = 'review',
    hasWorkflow = false,
    hasPublishHandoff = false,
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
              : hasPublishHandoff
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
    const handoffState = hasPublishHandoff ? 'ready' : 'idle';
    const assistantSummary =
        normalizedAssistantState === 'engaged'
            ? 'Collaborate Assistant is engaged with the active collaboration flow.'
            : normalizedAssistantState === 'ready'
              ? hasWorkflow
                  ? 'Collaborate Assistant is ready while collaboration workflow leads this room.'
                  : 'Collaborate Assistant is ready to help the current Collaborate activity.'
              : hasWorkflow
                ? 'Collaborate Assistant stays quiet while collaboration flow stays primary.'
                : 'Collaborate Assistant stays quiet until collaboration context deepens.';

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
