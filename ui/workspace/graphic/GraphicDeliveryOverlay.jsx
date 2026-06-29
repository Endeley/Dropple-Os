'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { resolveGraphicDeliveryProjection } from './graphicDeliveryProjection.js';

export function GraphicDeliveryOverlay({
    workspaceId = null,
    modeId = null,
    selectedNode = null,
    nodesById = {},
}) {
    const isGraphic = workspaceId === 'graphic' || modeId === 'graphic';
    const projection = useMemo(
        () => resolveGraphicDeliveryProjection(selectedNode, nodesById),
        [nodesById, selectedNode],
    );
    const [selectedAudienceId, setSelectedAudienceId] = useState(null);

    useEffect(() => {
        setSelectedAudienceId(null);
    }, [projection?.artboardId]);

    const selectedAudience = useMemo(
        () => projection?.audiences.find((entry) => entry.id === selectedAudienceId) ?? null,
        [projection?.audiences, selectedAudienceId],
    );
    const stopCanvasPropagation = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    if (!isGraphic || !projection) return null;

    return (
        <div className='graphic-delivery' data-testid='graphic-delivery-overlay'>
            <div className='graphic-delivery__content'>
                <div className='graphic-delivery__copy'>
                    <p className='graphic-delivery__eyebrow'>Creative delivery</p>
                    <h2 data-testid='graphic-delivery-title'>{projection.title}</h2>
                    <p className='graphic-delivery__subtitle'>{projection.subtitle}</p>
                    <p
                        className='graphic-delivery__supporting'
                        data-testid='graphic-delivery-audience-first'>
                        Audience and delivery context come first. Format can follow once the destination is clear.
                    </p>
                    <p
                        className='graphic-delivery__supporting'
                        data-testid='graphic-delivery-owner'>
                        {projection.ownership}
                    </p>
                </div>

                <div className='graphic-delivery__cards' data-testid='graphic-delivery-audiences'>
                    {projection.audiences.map((entry) => (
                        <button
                            key={entry.id}
                            type='button'
                            className='graphic-delivery__card'
                            data-testid={`graphic-delivery-audience-${entry.id}`}
                            onPointerDown={stopCanvasPropagation}
                            onClick={(event) => {
                                stopCanvasPropagation(event);
                                setSelectedAudienceId(entry.id);
                            }}>
                            <div className='graphic-delivery__card-title'>{entry.label}</div>
                            <div className='graphic-delivery__card-meta'>{entry.intent}</div>
                        </button>
                    ))}
                </div>

                {selectedAudience ? (
                    <div className='graphic-delivery__confirmation' data-testid='graphic-delivery-confirmation'>
                        <div className='graphic-delivery__label'>Delivery direction selected</div>
                        <p className='graphic-delivery__confirmation-copy'>
                            {selectedAudience.label} is now the delivery context. Export mechanics can adapt later to fit
                            that audience.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default GraphicDeliveryOverlay;
