function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

const BUILD_ASSISTANT_ACTIONS = Object.freeze({
    application: Object.freeze({
        assistantLabel: 'Build Assistant',
        recommendLabel: 'Ask Build Assistant',
        generateLabel: 'Generate App Options',
        explainLabel: 'Improve This App',
    }),
    automation: Object.freeze({
        assistantLabel: 'Build Assistant',
        recommendLabel: 'Ask Build Assistant',
        generateLabel: 'Generate Workflow Options',
        explainLabel: 'Improve This Workflow',
    }),
    logic: Object.freeze({
        assistantLabel: 'Build Assistant',
        recommendLabel: 'Ask Build Assistant',
        generateLabel: 'Generate Logic Options',
        explainLabel: 'Improve This Logic',
    }),
    ai: Object.freeze({
        assistantLabel: 'Build Assistant',
        recommendLabel: 'Ask Build Assistant',
        generateLabel: 'Generate AI Options',
        explainLabel: 'Improve This Agent',
    }),
    conversion: Object.freeze({
        assistantLabel: 'Build Assistant',
        recommendLabel: 'Ask Build Assistant',
        generateLabel: 'Generate Conversion Options',
        explainLabel: 'Improve This Pipeline',
    }),
});

const FALLBACK_ACTIONS = Object.freeze({
    assistantLabel: 'Assistant',
    recommendLabel: 'Ask Assistant',
    generateLabel: 'Generate Options',
    explainLabel: 'Improve This',
});

export function resolveBuildAssistantActionLabels(entryId) {
    const normalized = asNonEmptyString(entryId)?.toLowerCase() ?? null;
    return BUILD_ASSISTANT_ACTIONS[normalized] ?? FALLBACK_ACTIONS;
}
