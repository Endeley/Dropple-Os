'use client';

import { useCallback, useMemo } from 'react';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent.js';
import { getGraphicVocabularyMeanings, buildGraphicVocabularyActivation } from './graphicVocabularyActivation.js';

export function GraphicVocabularyOverlay({
    workspaceId = null,
    modeId = null,
    selectedNode = null,
    nodesById = {},
    firstExpressionDismissedNodeId = null,
}) {
    const isGraphic = workspaceId === 'graphic' || modeId === 'graphic';
    const isArtboard =
        selectedNode?.type === 'frame' &&
        selectedNode?.metadata?.graphicArtifactRole === 'artboard' &&
        selectedNode?.metadata?.graphicFirstExpression === true;
    const childCount = useMemo(
        () =>
            Object.values(nodesById ?? {}).filter((node) => node?.parentId === selectedNode?.id).length,
        [nodesById, selectedNode?.id],
    );
    const visible =
        isGraphic &&
        isArtboard &&
        childCount === 0 &&
        selectedNode?.id &&
        firstExpressionDismissedNodeId === selectedNode.id;
    const meanings = useMemo(() => getGraphicVocabularyMeanings(), []);
    const stopCanvasPropagation = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleCreate = useCallback(
        (event, meaningId) => {
            stopCanvasPropagation(event);
            if (!selectedNode) return;
            const activation = buildGraphicVocabularyActivation(meaningId, selectedNode);
            nodeCreateIntent(activation.createIntent);
            if (activation.selectionIntent) {
                canvasBus.emit('intent.selection.set', activation.selectionIntent);
            }
        },
        [selectedNode, stopCanvasPropagation],
    );

    if (!visible) return null;

    return (
        <div className='graphic-vocabulary' data-testid='graphic-vocabulary-overlay'>
            <div className='graphic-vocabulary__content'>
                <div className='graphic-vocabulary__copy'>
                    <p className='graphic-vocabulary__eyebrow'>Creative vocabulary</p>
                    <h2 data-testid='graphic-vocabulary-title'>What should this Composition express next?</h2>
                    <p className='graphic-vocabulary__subtitle'>
                        Choose meaning first. The system will resolve it into the right expressive vocabulary.
                    </p>
                    <p
                        className='graphic-vocabulary__supporting'
                        data-testid='graphic-vocabulary-meaning-first'>
                        You do not need to choose implementation primitives yet. Start with the role this Composition needs.
                    </p>
                </div>

                <div className='graphic-vocabulary__cards'>
                    {meanings.map((entry) => (
                        <button
                            key={entry.id}
                            type='button'
                            className='graphic-vocabulary__card'
                            data-testid={`graphic-vocabulary-${entry.id}`}
                            onPointerDown={stopCanvasPropagation}
                            onClick={(event) => handleCreate(event, entry.id)}>
                            <div className='graphic-vocabulary__card-title'>{entry.label}</div>
                            <div className='graphic-vocabulary__card-meta'>{entry.type}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GraphicVocabularyOverlay;
