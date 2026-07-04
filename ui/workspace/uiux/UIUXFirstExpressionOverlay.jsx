'use client';

import { useCallback, useMemo } from 'react';
import { getUIUXEmptyWorldStarters } from './uiuxEmptyWorldExpression.js';

function normalizeStarterKey(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
}

function resolveStarterIdentity(node) {
    const starters = getUIUXEmptyWorldStarters();
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

function isFirstExpressionNode(node) {
    return (
        node?.type === 'frame' &&
        typeof node?.id === 'string' &&
        node.id.length > 0 &&
        (node?.metadata?.uiuxFirstExpression === true || resolveStarterIdentity(node) != null)
    );
}

function resolveFirstExpressionNode(selectedNode, nodesById, nodeCount) {
    if (isFirstExpressionNode(selectedNode)) {
        return selectedNode;
    }

    const candidates = Object.values(nodesById ?? {}).filter(isFirstExpressionNode);
    if (candidates.length === 0) return null;
    if (Number(nodeCount) === 1) {
        return candidates[0] ?? null;
    }
    return candidates[0] ?? null;
}

function resolveMeaningfulExistenceCopy(projection) {
    if (projection.scenario === 'landingPage') {
        return 'Your application now has a place where its first public story can exist.';
    }
    if (projection.scenario === 'dashboard') {
        return 'Your application now has a place where its first information world can exist.';
    }
    if (projection.scenario === 'login') {
        return 'Your application now has a place where its first trust moment can exist.';
    }
    if (projection.scenario === 'settings') {
        return 'Your application now has a place where its first control surface can exist.';
    }
    return 'Your application now has a place where its first real presence can exist.';
}

export function UIUXFirstExpressionOverlay({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
    nodesById = null,
    selectedNode = null,
    dismissedNodeId = null,
    onDismiss = null,
}) {
    const isUIUX = workspaceId === 'create' || workspaceId === 'uiux' || modeId === 'create' || modeId === 'uiux';
    const firstExpressionNode = useMemo(
        () => resolveFirstExpressionNode(selectedNode, nodesById, nodeCount),
        [nodeCount, nodesById, selectedNode],
    );
    const isFirstExpressionCandidate =
        isUIUX &&
        Number(nodeCount) > 0 &&
        firstExpressionNode?.id &&
        dismissedNodeId !== firstExpressionNode.id;
    const projection = useMemo(
        () => (isFirstExpressionCandidate ? resolveStarterProjection(firstExpressionNode) : null),
        [firstExpressionNode, isFirstExpressionCandidate],
    );
    const stopCanvasPropagation = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);
    const dismiss = useCallback((event) => {
        stopCanvasPropagation(event);
        if (!firstExpressionNode?.id) return;
        onDismiss?.(firstExpressionNode.id);
    }, [firstExpressionNode?.id, onDismiss, stopCanvasPropagation]);

    if (!projection) return null;

    return (
        <div className='uiux-first-expression' data-testid='uiux-first-expression'>
            <div className={`uiux-first-expression__content is-${projection.accent}`}>
                <div className='uiux-first-expression__copy'>
                    <p className='uiux-first-expression__eyebrow'>First expression</p>
                    <h2 data-testid='uiux-first-expression-title'>
                        Your <span>{projection.label}</span> now exists in this world.
                    </h2>
                    <p className='uiux-first-expression__subtitle' data-testid='uiux-first-expression-meaning'>
                        {resolveMeaningfulExistenceCopy(projection)}
                    </p>
                    <p className='uiux-first-expression__supporting' data-testid='uiux-first-expression-owner'>
                        It is here because your direction crossed into existence, not because the editor inserted a default surface.
                    </p>
                </div>

                <div className='uiux-first-expression__actions'>
                    <button
                        type='button'
                        className='uiux-first-expression__primary'
                        data-testid='uiux-first-expression-continue'
                        onPointerDown={stopCanvasPropagation}
                        onClick={dismiss}>
                        Start shaping this {projection.title}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UIUXFirstExpressionOverlay;
