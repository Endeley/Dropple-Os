function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

const PUBLISH_ASSISTANT_ACTIONS = Object.freeze({
    governance: Object.freeze({
        assistantLabel: 'Publishing Assistant',
        recommendLabel: 'Ask Publishing Assistant',
        generateLabel: 'Generate Governance Options',
        explainLabel: 'Improve This Policy',
    }),
    versioning: Object.freeze({
        assistantLabel: 'Publishing Assistant',
        recommendLabel: 'Ask Publishing Assistant',
        generateLabel: 'Generate Release Options',
        explainLabel: 'Improve This Version Plan',
    }),
    tokens: Object.freeze({
        assistantLabel: 'Publishing Assistant',
        recommendLabel: 'Ask Publishing Assistant',
        generateLabel: 'Generate Token Options',
        explainLabel: 'Improve This Token Set',
    }),
    components: Object.freeze({
        assistantLabel: 'Publishing Assistant',
        recommendLabel: 'Ask Publishing Assistant',
        generateLabel: 'Generate Component Options',
        explainLabel: 'Improve This Component Library',
    }),
    themes: Object.freeze({
        assistantLabel: 'Publishing Assistant',
        recommendLabel: 'Ask Publishing Assistant',
        generateLabel: 'Generate Theme Options',
        explainLabel: 'Improve This Theme',
    }),
    variants: Object.freeze({
        assistantLabel: 'Publishing Assistant',
        recommendLabel: 'Ask Publishing Assistant',
        generateLabel: 'Generate Variant Options',
        explainLabel: 'Improve This Variant Set',
    }),
    conversion: Object.freeze({
        assistantLabel: 'Publishing Assistant',
        recommendLabel: 'Ask Publishing Assistant',
        generateLabel: 'Generate Delivery Options',
        explainLabel: 'Improve This Export Plan',
    }),
    review: Object.freeze({
        assistantLabel: 'Publishing Assistant',
        recommendLabel: 'Ask Publishing Assistant',
        generateLabel: 'Generate Review Options',
        explainLabel: 'Improve This Release Review',
    }),
});

const FALLBACK_ACTIONS = Object.freeze({
    assistantLabel: 'Assistant',
    recommendLabel: 'Ask Assistant',
    generateLabel: 'Generate Options',
    explainLabel: 'Improve This',
});

export function resolvePublishAssistantActionLabels(entryId) {
    const normalized = asNonEmptyString(entryId)?.toLowerCase() ?? null;
    return PUBLISH_ASSISTANT_ACTIONS[normalized] ?? FALLBACK_ACTIONS;
}
