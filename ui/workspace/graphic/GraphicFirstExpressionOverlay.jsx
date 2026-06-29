'use client';

import { useCallback, useMemo } from 'react';
import { resolveGraphicCompositionProjection } from './graphicCompositionProjection.js';

function StepList({ steps = [] }) {
    return (
        <div className='graphic-first-expression__steps'>
            {steps.map((entry) => (
                <div key={entry} className='graphic-first-expression__step'>
                    <span>•</span>
                    <span>{entry}</span>
                </div>
            ))}
        </div>
    );
}

function CapabilityChips({ entries = [] }) {
    return (
        <div className='graphic-first-expression__chips'>
            {entries.map((entry) => (
                <span key={entry} className='graphic-first-expression__chip'>
                    {entry}
                </span>
            ))}
        </div>
    );
}

export function GraphicFirstExpressionOverlay({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
    selectedNode = null,
    dismissedNodeId = null,
    onDismiss = null,
}) {
    const starterId = selectedNode?.metadata?.graphicStarterId ?? null;
    const isGraphic = workspaceId === 'graphic' || modeId === 'graphic';
    const isFirstExpression =
        selectedNode?.type === 'frame' &&
        selectedNode?.metadata?.graphicArtifactRole === 'artboard' &&
        selectedNode?.metadata?.graphicFirstExpression === true;
    const visible =
        isGraphic &&
        Number(nodeCount) > 0 &&
        isFirstExpression &&
        selectedNode?.id &&
        dismissedNodeId !== selectedNode.id;
    const composition = useMemo(
        () => (starterId ? resolveGraphicCompositionProjection(starterId) : null),
        [starterId],
    );
    const stopCanvasPropagation = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const dismiss = useCallback((event) => {
        stopCanvasPropagation(event);
        if (!selectedNode?.id) return;
        onDismiss?.(selectedNode.id);
    }, [onDismiss, selectedNode?.id, stopCanvasPropagation]);

    if (!visible || !composition) return null;

    return (
        <div className='graphic-first-expression' data-testid='graphic-first-expression'>
            <div className='graphic-first-expression__content'>
                <div className='graphic-first-expression__copy'>
                    <p className='graphic-first-expression__eyebrow'>First expression</p>
                    <h2 data-testid='graphic-first-expression-title'>
                        Your Composition now has somewhere to exist.
                    </h2>
                    <p className='graphic-first-expression__subtitle'>
                        This Artboard is the first bounded expression of your {composition.title}.
                    </p>
                    <p
                        className='graphic-first-expression__supporting'
                        data-testid='graphic-first-expression-meaning'>
                        The Artboard appears because the Composition now needs visible existence, not because the editor asked for one.
                    </p>
                    <p
                        className='graphic-first-expression__supporting'
                        data-testid='graphic-first-expression-owner'>
                        Composition remains the owner. The Artboard is where that Composition begins to take shape.
                    </p>
                </div>

                <div className='graphic-first-expression__grid'>
                    <div className='graphic-first-expression__section'>
                        <div className='graphic-first-expression__label'>Next meaningful steps</div>
                        <StepList steps={composition.nextMeaningfulSteps} />
                    </div>
                    <div className='graphic-first-expression__section'>
                        <div className='graphic-first-expression__label'>Capability domains</div>
                        <CapabilityChips entries={composition.capabilityDomains} />
                    </div>
                </div>

                <div className='graphic-first-expression__actions'>
                    <button
                        type='button'
                        className='graphic-first-expression__primary'
                        data-testid='graphic-first-expression-continue'
                        onPointerDown={stopCanvasPropagation}
                        onClick={dismiss}>
                        Start shaping this Artboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GraphicFirstExpressionOverlay;
