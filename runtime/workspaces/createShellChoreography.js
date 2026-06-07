function normalizeUtilityPanel(value) {
    return value === 'navigate' || value === 'blueprints' ? value : 'project';
}

function normalizeAssistantState(value) {
    return value === 'engaged' || value === 'ready' ? value : 'idle';
}

export function resolveCreateShellChoreography({
    utilityPanel = 'project',
    hasSelection = false,
    hasMotionContext = false,
    assistantState = 'idle',
    hasEditorEmergence = false,
} = {}) {
    const normalizedUtilityPanel = normalizeUtilityPanel(utilityPanel);
    const normalizedAssistantState = normalizeAssistantState(assistantState);

    const dominantContext = hasMotionContext
        ? 'motion'
        : hasSelection
          ? 'selection'
          : normalizedAssistantState === 'engaged'
            ? 'assistant'
            : normalizedUtilityPanel === 'blueprints'
              ? 'blueprints'
              : normalizedUtilityPanel === 'navigate'
                ? 'navigation'
                : hasEditorEmergence
                  ? 'emergence'
                  : 'project';

    const utilityState =
        normalizedUtilityPanel === 'blueprints'
            ? 'blueprints'
            : normalizedUtilityPanel === 'navigate'
              ? 'navigation'
              : dominantContext === 'project'
                ? 'guiding'
                : 'receded';

    const utilitySummary =
        utilityState === 'guiding'
            ? 'Project context is leading this Create session.'
            : utilityState === 'navigation'
              ? 'Navigate the world and return without losing Create context.'
              : utilityState === 'blueprints'
                ? 'Blueprint actions are in focus for this project.'
                : dominantContext === 'motion'
                  ? 'Create Studio yields while motion authoring is active.'
                  : dominantContext === 'selection'
                    ? 'Create Studio yields while editor selection is active.'
                    : dominantContext === 'assistant'
                      ? 'Create Studio yields while assistant help is engaged.'
                      : 'Create Studio yields while the editor emerges from the project world.';

    const assistantSummary =
        normalizedAssistantState === 'engaged'
            ? 'Assistant is engaged with the current task.'
            : normalizedAssistantState === 'ready'
              ? 'Assistant is ready to help the current Create activity.'
              : 'Assistant stays quiet until help is requested.';

    const timelineSummary = hasMotionContext
        ? 'Motion context is active and the timeline should rise.'
        : 'Motion context is dormant and the timeline should stay compact.';

    return Object.freeze({
        dominantContext,
        utilityState,
        utilitySummary,
        assistantState: normalizedAssistantState,
        assistantSummary,
        timelineState: hasMotionContext ? 'raised' : 'dormant',
        timelineSummary,
    });
}
