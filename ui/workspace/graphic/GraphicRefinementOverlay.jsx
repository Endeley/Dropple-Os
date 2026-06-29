'use client';

import { useMemo } from 'react';
import { resolveGraphicRefinementProjection } from './graphicRefinementProjection.js';

export function GraphicRefinementOverlay({
    workspaceId = null,
    modeId = null,
    selectedNode = null,
    nodesById = {},
}) {
    const isGraphic = workspaceId === 'graphic' || modeId === 'graphic';
    const projection = useMemo(
        () => resolveGraphicRefinementProjection(selectedNode, nodesById),
        [nodesById, selectedNode],
    );

    if (!isGraphic || !projection) return null;

    return (
        <div className='graphic-refinement' data-testid='graphic-refinement-overlay'>
            <div className='graphic-refinement__content'>
                <div className='graphic-refinement__copy'>
                    <p className='graphic-refinement__eyebrow'>Creative refinement</p>
                    <h2 data-testid='graphic-refinement-title'>{projection.title}</h2>
                    <p className='graphic-refinement__subtitle'>{projection.subtitle}</p>
                    <p
                        className='graphic-refinement__supporting'
                        data-testid='graphic-refinement-quality-first'>
                        {projection.qualityFocus}
                    </p>
                    <p
                        className='graphic-refinement__supporting'
                        data-testid='graphic-refinement-owner'>
                        {projection.ownership}
                    </p>
                </div>

                <div className='graphic-refinement__grid'>
                    <div className='graphic-refinement__section'>
                        <div className='graphic-refinement__label'>Relationship-driven prompts</div>
                        <div className='graphic-refinement__list' data-testid='graphic-refinement-relationships'>
                            {projection.relationshipPrompts.map((entry) => (
                                <div key={entry} className='graphic-refinement__item'>
                                    <span>•</span>
                                    <span>{entry}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='graphic-refinement__section'>
                        <div className='graphic-refinement__label'>Communication quality</div>
                        <div className='graphic-refinement__chips'>
                            {projection.qualitySignals.map((entry) => (
                                <span key={entry} className='graphic-refinement__chip'>
                                    {entry}
                                </span>
                            ))}
                        </div>
                        <p className='graphic-refinement__meta' data-testid='graphic-refinement-composition'>
                            {projection.compositionTitle} now has {projection.expressiveCount} expressive element
                            {projection.expressiveCount === 1 ? '' : 's'} to refine together.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GraphicRefinementOverlay;
