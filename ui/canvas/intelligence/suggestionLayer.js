export const SUGGESTION_KIND = {
    ALIGN_ELEMENTS: 'ALIGN_ELEMENTS',
    DENSITY_NOTICE: 'DENSITY_NOTICE',
    EMPTY_VIEWPORT: 'EMPTY_VIEWPORT',
    SNAP_AVAILABLE: 'SNAP_AVAILABLE',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    VALIDATION_WARNING: 'VALIDATION_WARNING',
    VALIDATION_INFO: 'VALIDATION_INFO',
};

if (process.env.NODE_ENV === 'development') {
    Object.freeze(SUGGESTION_KIND);
}

export function mapObserverInsightsToSuggestions(insights = [], context = {}) {
    if (!Array.isArray(insights) || insights.length === 0) return [];

    const suggestions = [];
    const byType = new Map();

    insights.forEach((insight) => {
        if (!insight?.type) return;
        const list = byType.get(insight.type) ?? [];
        list.push(insight);
        byType.set(insight.type, list);
    });

    const alignmentInsights = [
        ...(byType.get('ALIGNMENT_IN_PROGRESS') ?? []),
        ...(byType.get('SNAP_CANDIDATE_VISIBLE') ?? []),
    ];
    if (alignmentInsights.length) {
        const nodeIds = extractNodeIds(alignmentInsights);
        suggestions.push({
            id: buildSuggestionId(SUGGESTION_KIND.ALIGN_ELEMENTS, alignmentInsights),
            kind: SUGGESTION_KIND.ALIGN_ELEMENTS,
            priority: 'medium',
            message: 'These elements are close to alignment.',
            basedOn: alignmentInsights,
            context: nodeIds.length ? { nodeIds } : undefined,
        });
    }

    const densityInsights = byType.get('DENSE_CLUSTER') ?? [];
    densityInsights.forEach((insight) => {
        suggestions.push({
            id: buildSuggestionId(SUGGESTION_KIND.DENSITY_NOTICE, [insight]),
            kind: SUGGESTION_KIND.DENSITY_NOTICE,
            priority: 'low',
            message: 'This area is becoming visually dense.',
            basedOn: [insight],
            context: insight.region ? { region: insight.region } : undefined,
        });
    });

    const sparseInsights = byType.get('SPARSE_VIEWPORT') ?? [];
    if (sparseInsights.length) {
        suggestions.push({
            id: buildSuggestionId(SUGGESTION_KIND.EMPTY_VIEWPORT, sparseInsights),
            kind: SUGGESTION_KIND.EMPTY_VIEWPORT,
            priority: 'low',
            message: 'Your current view contains few elements.',
            basedOn: sparseInsights,
        });
    }

    const snapInsights = byType.get('SNAP_CANDIDATE_VISIBLE') ?? [];
    if (snapInsights.length && context.isDragging) {
        suggestions.push({
            id: buildSuggestionId(SUGGESTION_KIND.SNAP_AVAILABLE, snapInsights),
            kind: SUGGESTION_KIND.SNAP_AVAILABLE,
            priority: 'high',
            message: 'Alignment guide available.',
            basedOn: snapInsights,
        });
    }

    return suggestions;
}

export function validationIssueToSuggestion(issue) {
    if (!issue?.ruleId || !issue?.severity) return null;

    const severity = issue.severity;
    const kind =
        severity === 'error'
            ? SUGGESTION_KIND.VALIDATION_ERROR
            : severity === 'warning'
              ? SUGGESTION_KIND.VALIDATION_WARNING
              : SUGGESTION_KIND.VALIDATION_INFO;

    const priority =
        severity === 'error' ? 'high' : severity === 'warning' ? 'medium' : 'low';

    const message = validationMessage(issue);

    return {
        id: `validation:${issue.id}`,
        kind,
        priority,
        message,
        basedOn: [issue.id],
        context: issue.affected ?? undefined,
    };
}

function validationMessage(issue) {
    switch (issue.ruleId) {
        case 'OVERLAP':
            return 'Some elements overlap.';
        case 'TOO_CLOSE':
            return 'Some elements are very close together.';
        case 'MISALIGNED':
            return 'Some elements are almost aligned.';
        case 'OFFSCREEN_CRITICAL':
            return 'Important elements are outside the viewport.';
        case 'INCONSISTENT_SPACING':
            return 'Spacing appears inconsistent in a row or column.';
        default:
            return issue.message || 'Validation issue detected.';
    }
}

function extractNodeIds(insights) {
    const ids = new Set();
    insights.forEach((insight) => {
        const nodes = insight.nodes ?? [];
        nodes.forEach((id) => {
            if (id) ids.add(id);
        });
        if (insight.targetId) {
            ids.add(insight.targetId);
        }
    });
    return Array.from(ids);
}

function buildSuggestionId(kind, insights) {
    const parts = insights
        .map((insight) => stableInsightKey(insight))
        .sort()
        .join('|');
    return hashString(`${kind}:${parts}`);
}

function stableInsightKey(insight) {
    if (!insight?.type) return '';
    const payload = stableStringify(insight);
    return `${insight.type}:${payload}`;
}

function stableStringify(value) {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'object') return String(value);
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${key}:${stableStringify(value[key])}`).join(',')}}`;
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return `s_${hash.toString(16)}`;
}
