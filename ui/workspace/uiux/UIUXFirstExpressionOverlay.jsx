'use client';

import { useCallback, useMemo } from 'react';
import { resolveUIUXFirstExpressionProjection } from './uiuxFirstExpressionProjection.js';

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
    const firstExpressionState = useMemo(
        () =>
            resolveUIUXFirstExpressionProjection({
                workspaceId,
                modeId,
                nodeCount,
                nodesById,
                selectedNode,
                dismissedNodeId,
            }),
        [dismissedNodeId, modeId, nodeCount, nodesById, selectedNode, workspaceId],
    );
    const firstExpressionNode = firstExpressionState?.node ?? null;
    const projection = firstExpressionState?.projection ?? null;
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
