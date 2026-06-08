function normalizeAssistantState(value) {
    return value === 'engaged' || value === 'ready' ? value : 'idle';
}

function normalizeEntryId(value) {
    return value === 'production' || value === 'knowledge' || value === 'education' ? value : 'review';
}

function resolveFocusState(entryId) {
    if (entryId === 'production') return 'alignment';
    if (entryId === 'knowledge') return 'discussion';
    if (entryId === 'education') return 'learning';
    return 'review';
}

function resolveFocusSummary(focusState) {
    if (focusState === 'alignment') {
        return 'Collaborate is emphasizing team alignment and coordinated delivery.';
    }
    if (focusState === 'discussion') {
        return 'Collaborate is emphasizing discussion, shared understanding, and durable team context.';
    }
    if (focusState === 'learning') {
        return 'Collaborate is emphasizing guided learning and shared understanding.';
    }
    return 'Collaborate is emphasizing review, feedback, and aligned decisions.';
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
    const hasActiveCollaboration = hasWorkflow || hasPublishHandoff;
    const dominantContext =
        normalizedAssistantState === 'engaged'
            ? 'assistant'
            : hasActiveCollaboration
              ? focusState === 'learning'
                  ? 'education'
                  : focusState === 'discussion' || focusState === 'alignment'
                    ? 'discussion'
                    : 'review'
              : 'project';

    const roomState =
        dominantContext === 'assistant'
            ? 'assistant-facilitating'
            : dominantContext === 'education'
              ? 'education-guiding'
              : dominantContext === 'discussion'
                ? 'discussion-active'
                : dominantContext === 'review'
                  ? 'review-focused'
                  : 'receded';

    const workflowState = hasWorkflow ? (normalizedAssistantState === 'engaged' ? 'yielding' : 'leading') : 'dormant';
    const handoffState = hasPublishHandoff ? 'ready' : 'idle';
    const assistantSummary =
        normalizedAssistantState === 'engaged'
            ? 'Collaborate Assistant is facilitating the active collaboration flow.'
            : normalizedAssistantState === 'ready'
              ? dominantContext === 'education'
                  ? 'Collaborate Assistant is ready to support guided learning in this room.'
                  : dominantContext === 'discussion'
                    ? 'Collaborate Assistant is ready to support discussion and alignment in this room.'
                    : hasActiveCollaboration
                      ? 'Collaborate Assistant is ready to support review and alignment in this room.'
                      : 'Collaborate Assistant is ready to help the current Collaborate activity.'
              : hasActiveCollaboration
                ? 'Collaborate Assistant stays quiet while people stay aligned on the work.'
                : 'Collaborate Assistant stays quiet until people need help aligning.';

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
