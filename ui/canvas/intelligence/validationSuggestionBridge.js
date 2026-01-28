import { validationIssueToSuggestion } from './suggestionLayer.js';

export const VALIDATION_SUPPRESSES_SUGGESTIONS = {
    MISALIGNED: ['ALIGN_ELEMENTS'],
    TOO_CLOSE: ['DENSITY_NOTICE'],
    OVERLAP: ['ALIGN_ELEMENTS', 'DENSITY_NOTICE'],
    INCONSISTENT_SPACING: ['ALIGN_ELEMENTS'],
    OFFSCREEN_CRITICAL: ['EMPTY_VIEWPORT'],
};

if (process.env.NODE_ENV === 'development') {
    Object.freeze(VALIDATION_SUPPRESSES_SUGGESTIONS);
}

export function mergeValidationSuggestions({
    validationIssues = [],
    suggestions = [],
}) {
    const validationSuggestions = validationIssues
        .map((issue) => validationIssueToSuggestion(issue))
        .filter(Boolean);

    const suppressedKinds = new Set();
    validationIssues.forEach((issue) => {
        const kinds = VALIDATION_SUPPRESSES_SUGGESTIONS[issue.ruleId];
        if (!kinds) return;
        kinds.forEach((kind) => suppressedKinds.add(kind));
    });

    const filteredSuggestions = suggestions.filter(
        (suggestion) => !suppressedKinds.has(suggestion.kind)
    );

    if (process.env.NODE_ENV === 'development') {
        assertSuppression(validationIssues, suggestions, suppressedKinds);
    }

    const merged = [...validationSuggestions, ...filteredSuggestions];

    return mergeAndRank(merged);
}

function mergeAndRank(list) {
    const unique = new Map();
    list.forEach((item) => {
        if (!item?.id) return;
        if (!unique.has(item.id)) {
            unique.set(item.id, item);
        }
    });

    const merged = Array.from(unique.values());
    merged.sort((a, b) => {
        const aRank = priorityRank(a);
        const bRank = priorityRank(b);
        if (aRank !== bRank) return aRank - bRank;
        if (a.id === b.id) return 0;
        return a.id < b.id ? -1 : 1;
    });
    return merged;
}

function assertSuppression(validationIssues, suggestions, suppressedKinds) {
    if (!validationIssues?.length || !suppressedKinds.size) return;
    const leaking = suggestions.filter((s) => suppressedKinds.has(s.kind));
    if (leaking.length > 0) {
        console.warn('[ValidationBridge] Suppressed suggestion kinds detected:', {
            suppressedKinds: Array.from(suppressedKinds),
            leaking: leaking.map((s) => s.kind),
        });
    }
}

function priorityRank(item) {
    const kind = item.kind || '';
    if (kind.startsWith('VALIDATION_ERROR')) return 0;
    if (kind.startsWith('VALIDATION_WARNING')) return 1;
    if (kind === 'SNAP_AVAILABLE' || kind === 'ALIGN_ELEMENTS') return 2;
    if (kind === 'DENSITY_NOTICE' || kind === 'EMPTY_VIEWPORT') return 3;
    if (item.priority === 'high') return 4;
    if (item.priority === 'medium') return 5;
    return 6;
}
