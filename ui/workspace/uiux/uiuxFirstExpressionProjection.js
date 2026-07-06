'use client';

const UIUX_FIRST_EXPRESSION_STARTERS = Object.freeze([
    Object.freeze({
        id: 'blankPage',
        label: 'Blank Page',
        title: 'Blank Page',
        scenario: null,
        accent: 'violet',
    }),
    Object.freeze({
        id: 'landingPage',
        label: 'Landing Page',
        title: 'Landing Page',
        scenario: 'landingPage',
        accent: 'blue',
    }),
    Object.freeze({
        id: 'dashboard',
        label: 'Dashboard',
        title: 'Dashboard',
        scenario: 'dashboard',
        accent: 'teal',
    }),
    Object.freeze({
        id: 'login',
        label: 'Login Screen',
        title: 'Login Screen',
        scenario: 'login',
        accent: 'violet',
    }),
    Object.freeze({
        id: 'settings',
        label: 'Settings Page',
        title: 'Settings Page',
        scenario: 'settings',
        accent: 'amber',
    }),
]);

function normalizeStarterKey(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
}

function resolveStarterIdentity(node) {
    const starters = UIUX_FIRST_EXPRESSION_STARTERS;
    const metadataStarterId = normalizeStarterKey(node?.metadata?.uiuxStarterId ?? null);
    if (metadataStarterId) {
        const starter = starters.find((entry) => entry.id === metadataStarterId) ?? null;
        if (starter) return starter;
    }

    const scenarioKey = normalizeStarterKey(node?.metadata?.scenario ?? node?.props?.scenario ?? null);
    if (scenarioKey) {
        const starter = starters.find((entry) => normalizeStarterKey(entry.scenario) === scenarioKey) ?? null;
        if (starter) return starter;
    }

    const titleKey = normalizeStarterKey(node?.name ?? null);
    if (titleKey) {
        const starter =
            starters.find(
                (entry) =>
                    normalizeStarterKey(entry.title) === titleKey ||
                    normalizeStarterKey(entry.label) === titleKey,
            ) ?? null;
        if (starter) return starter;
    }

    return null;
}

function resolveStarterProjection(selectedNode) {
    const starter = resolveStarterIdentity(selectedNode);
    const title = starter?.title ?? selectedNode?.name ?? 'Page';
    const label = starter?.label ?? selectedNode?.name ?? 'Page';
    const accent = starter?.accent ?? 'violet';

    return {
        title,
        label,
        accent,
        scenario: starter?.scenario ?? selectedNode?.metadata?.scenario ?? null,
    };
}

export function isUIUXFirstExpressionNode(node) {
    return (
        node?.type === 'frame' &&
        typeof node?.id === 'string' &&
        node.id.length > 0 &&
        (node?.metadata?.uiuxFirstExpression === true || resolveStarterIdentity(node) != null)
    );
}

export function resolveUIUXFirstExpressionNode(selectedNode, nodesById, nodeCount) {
    if (isUIUXFirstExpressionNode(selectedNode)) {
        return selectedNode;
    }

    const candidates = Object.values(nodesById ?? {}).filter(isUIUXFirstExpressionNode);
    if (candidates.length === 0) return null;
    if (Number(nodeCount) === 1) {
        return candidates[0] ?? null;
    }
    return candidates[0] ?? null;
}

export function resolveUIUXFirstExpressionProjection({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
    nodesById = null,
    selectedNode = null,
    dismissedNodeId = null,
} = {}) {
    const isUIUX = workspaceId === 'create' || workspaceId === 'uiux' || modeId === 'create' || modeId === 'uiux';
    const firstExpressionNode = resolveUIUXFirstExpressionNode(selectedNode, nodesById, nodeCount);
    const isFirstExpressionCandidate =
        isUIUX &&
        Number(nodeCount) === 1 &&
        firstExpressionNode?.id &&
        dismissedNodeId !== firstExpressionNode.id;

    if (!isFirstExpressionCandidate) return null;

    return {
        node: firstExpressionNode,
        projection: resolveStarterProjection(firstExpressionNode),
    };
}
