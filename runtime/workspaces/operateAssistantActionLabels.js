function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

const OPERATE_ASSISTANT_ACTIONS = Object.freeze({
    automation: Object.freeze({
        assistantLabel: 'Operations Assistant',
        recommendLabel: 'Ask Operations Assistant',
        generateLabel: 'Generate Workflow Options',
        explainLabel: 'Improve This Workflow',
    }),
    'systems-engineering': Object.freeze({
        assistantLabel: 'Operations Assistant',
        recommendLabel: 'Ask Operations Assistant',
        generateLabel: 'Generate System Options',
        explainLabel: 'Improve This System Model',
    }),
    'enterprise-operations': Object.freeze({
        assistantLabel: 'Operations Assistant',
        recommendLabel: 'Ask Operations Assistant',
        generateLabel: 'Generate Operations Options',
        explainLabel: 'Improve This Process',
    }),
    production: Object.freeze({
        assistantLabel: 'Operations Assistant',
        recommendLabel: 'Ask Operations Assistant',
        generateLabel: 'Generate Production Options',
        explainLabel: 'Improve This Runbook',
    }),
    governance: Object.freeze({
        assistantLabel: 'Operations Assistant',
        recommendLabel: 'Ask Operations Assistant',
        generateLabel: 'Generate Governance Options',
        explainLabel: 'Improve This Policy',
    }),
});

const FALLBACK_ACTIONS = Object.freeze({
    assistantLabel: 'Assistant',
    recommendLabel: 'Ask Assistant',
    generateLabel: 'Generate Options',
    explainLabel: 'Improve This',
});

export function resolveOperateAssistantActionLabels(entryId) {
    const normalized = asNonEmptyString(entryId)?.toLowerCase() ?? null;
    return OPERATE_ASSISTANT_ACTIONS[normalized] ?? FALLBACK_ACTIONS;
}
