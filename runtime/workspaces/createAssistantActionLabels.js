function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

const CREATE_ASSISTANT_ACTIONS = Object.freeze({
    uiux: Object.freeze({
        assistantLabel: 'Design Assistant',
        recommendLabel: 'Ask Design Assistant',
        generateLabel: 'Generate UI Options',
        explainLabel: 'Improve This Layout',
    }),
    graphic: Object.freeze({
        assistantLabel: 'Design Assistant',
        recommendLabel: 'Ask Design Assistant',
        generateLabel: 'Generate Graphic Options',
        explainLabel: 'Improve This Graphic',
    }),
    branding: Object.freeze({
        assistantLabel: 'Design Assistant',
        recommendLabel: 'Ask Design Assistant',
        generateLabel: 'Generate Brand Options',
        explainLabel: 'Improve This Brand',
    }),
    icons: Object.freeze({
        assistantLabel: 'Design Assistant',
        recommendLabel: 'Ask Design Assistant',
        generateLabel: 'Generate Icon Options',
        explainLabel: 'Improve This Icon Set',
    }),
    document: Object.freeze({
        assistantLabel: 'Design Assistant',
        recommendLabel: 'Ask Design Assistant',
        generateLabel: 'Generate Document Options',
        explainLabel: 'Improve This Document',
    }),
    animation: Object.freeze({
        assistantLabel: 'Media Assistant',
        recommendLabel: 'Ask Media Assistant',
        generateLabel: 'Generate Motion Options',
        explainLabel: 'Improve This Sequence',
    }),
    video: Object.freeze({
        assistantLabel: 'Media Assistant',
        recommendLabel: 'Ask Media Assistant',
        generateLabel: 'Generate Video Options',
        explainLabel: 'Improve This Sequence',
    }),
    audio: Object.freeze({
        assistantLabel: 'Media Assistant',
        recommendLabel: 'Ask Media Assistant',
        generateLabel: 'Generate Audio Options',
        explainLabel: 'Improve This Narrative',
    }),
    podcast: Object.freeze({
        assistantLabel: 'Media Assistant',
        recommendLabel: 'Ask Media Assistant',
        generateLabel: 'Generate Podcast Options',
        explainLabel: 'Improve This Episode',
    }),
});

const FALLBACK_ACTIONS = Object.freeze({
    assistantLabel: 'Assistant',
    recommendLabel: 'Ask Assistant',
    generateLabel: 'Generate Options',
    explainLabel: 'Improve This',
});

export function resolveCreateAssistantActionLabels(entryId) {
    const normalized = asNonEmptyString(entryId)?.toLowerCase() ?? null;
    return CREATE_ASSISTANT_ACTIONS[normalized] ?? FALLBACK_ACTIONS;
}
