'use client';

import { useCallback, useMemo, useState } from 'react';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent.js';
import {
    getGraphicEmptyWorldStarters,
    resolveGraphicEmptyWorldStarter,
    shouldShowGraphicEmptyWorld,
} from './graphicEmptyWorldExpression.js';
import { resolveGraphicCompositionProjection } from './graphicCompositionProjection.js';
import { buildGraphicFirstExpressionActivation } from './graphicFirstExpressionActivation.js';

function DirectionGlyph({ accent = 'coral' }) {
    const palette = {
        coral: { glow: 'rgba(251, 113, 133, 0.20)', stroke: '#fb7185' },
        blue: { glow: 'rgba(59, 130, 246, 0.18)', stroke: '#60a5fa' },
        gold: { glow: 'rgba(245, 158, 11, 0.18)', stroke: '#fbbf24' },
        violet: { glow: 'rgba(168, 85, 247, 0.18)', stroke: '#c084fc' },
        teal: { glow: 'rgba(45, 212, 191, 0.18)', stroke: '#2dd4bf' },
        slate: { glow: 'rgba(148, 163, 184, 0.18)', stroke: '#cbd5e1' },
    };
    const resolved = palette[accent] ?? palette.coral;

    return (
        <svg viewBox='0 0 48 48' aria-hidden='true'>
            <rect
                x='7'
                y='8'
                width='34'
                height='32'
                rx='10'
                fill={resolved.glow}
                stroke={resolved.stroke}
                strokeWidth='1.5'
            />
            <path
                d='M15 18h18M15 24h12M15 30h8'
                stroke={resolved.stroke}
                strokeWidth='1.75'
                strokeLinecap='round'
            />
            <circle cx='32.5' cy='29.5' r='3.5' fill='none' stroke={resolved.stroke} strokeWidth='1.5' />
        </svg>
    );
}

export function GraphicEmptyWorldOverlay({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
}) {
    const visible = shouldShowGraphicEmptyWorld({
        workspaceId,
        modeId,
        nodeCount,
    });
    const starters = useMemo(() => getGraphicEmptyWorldStarters(), []);
    const [selectedStarterId, setSelectedStarterId] = useState(null);
    const [compositionStarterId, setCompositionStarterId] = useState(null);
    const selectedStarter = useMemo(
        () => (selectedStarterId ? resolveGraphicEmptyWorldStarter(selectedStarterId) : null),
        [selectedStarterId],
    );
    const composition = useMemo(
        () => (compositionStarterId ? resolveGraphicCompositionProjection(compositionStarterId) : null),
        [compositionStarterId],
    );

    const stopCanvasPropagation = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleSelectStarter = useCallback((starterId) => {
        setSelectedStarterId(starterId);
    }, []);

    const handleBeginComposition = useCallback(() => {
        if (!selectedStarterId) return;
        setCompositionStarterId(selectedStarterId);
    }, [selectedStarterId]);

    const handleBeginFirstExpression = useCallback(() => {
        if (!compositionStarterId) return;
        const activation = buildGraphicFirstExpressionActivation(compositionStarterId);
        nodeCreateIntent(activation.createIntent);
        if (activation.selectionIntent) {
            canvasBus.emit('intent.selection.set', activation.selectionIntent);
        }
    }, [compositionStarterId]);

    if (!visible) return null;

    return (
        <div className='graphic-empty-world' data-testid='graphic-empty-world' data-world-state='empty'>
            <div className='graphic-empty-world__center'>
                {!selectedStarter && !composition ? (
                    <>
                        <div className='graphic-empty-world__copy'>
                            <p className='graphic-empty-world__eyebrow'>Graphic</p>
                            <h1 data-testid='graphic-empty-world-title'>Create visual communication.</h1>
                            <p className='graphic-empty-world__subtitle'>
                                Start from what you want to communicate, not from tools.
                            </p>
                            <p className='graphic-empty-world__supporting'>
                                Choose a direction. Your composition can evolve as the idea becomes clearer.
                            </p>
                        </div>

                        <div className='graphic-empty-world__cards' data-testid='graphic-empty-world-cards'>
                            {starters.map((starter) => (
                                <button
                                    key={starter.id}
                                    type='button'
                                    className={`graphic-empty-world__card is-${starter.accent}`}
                                    data-testid={`graphic-empty-world-card-${starter.id}`}
                                    onPointerDown={stopCanvasPropagation}
                                    onClick={(event) => {
                                        stopCanvasPropagation(event);
                                        handleSelectStarter(starter.id);
                                    }}>
                                    <div className='graphic-empty-world__card-icon'>
                                        <DirectionGlyph accent={starter.accent} />
                                    </div>
                                    <div className='graphic-empty-world__card-title'>{starter.label}</div>
                                    <div className='graphic-empty-world__card-description'>{starter.description}</div>
                                </button>
                            ))}
                        </div>

                        <p className='graphic-empty-world__guidance' data-testid='graphic-empty-world-guidance'>
                            Choose a communication direction first. You can refine the composition later.
                        </p>
                    </>
                ) : composition ? (
                    <div
                        className='graphic-empty-world__composition'
                        data-testid='graphic-composition-projection'>
                        <div className={`graphic-empty-world__composition-mark is-${selectedStarter?.accent ?? 'coral'}`}>
                            <DirectionGlyph accent={selectedStarter?.accent ?? 'coral'} />
                        </div>
                        <div className='graphic-empty-world__copy'>
                            <p className='graphic-empty-world__eyebrow'>Composition established</p>
                            <h1 data-testid='graphic-composition-title'>{composition.title}</h1>
                            <p className='graphic-empty-world__subtitle'>You now have a Composition.</p>
                            <p className='graphic-empty-world__supporting'>{composition.meaning}</p>
                            <p
                                className='graphic-empty-world__supporting'
                                data-testid='graphic-composition-ownership'>
                                {composition.ownership}
                            </p>
                        </div>

                        <div className='graphic-empty-world__projection-grid'>
                            <div className='graphic-empty-world__projection-section'>
                                <div className='graphic-empty-world__projection-label'>Next meaningful steps</div>
                                <div className='graphic-empty-world__projection-list'>
                                    {composition.nextMeaningfulSteps.map((entry) => (
                                        <div key={entry} className='graphic-empty-world__projection-step'>
                                            <span>•</span>
                                            <span>{entry}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='graphic-empty-world__projection-section'>
                                <div className='graphic-empty-world__projection-label'>Capability domains</div>
                                <div className='graphic-empty-world__projection-chips'>
                                    {composition.capabilityDomains.map((entry) => (
                                        <span key={entry} className='graphic-empty-world__projection-chip'>
                                            {entry}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <p
                            className='graphic-empty-world__guidance'
                            data-testid='graphic-composition-guidance'>
                            This Composition exists before any Artboard. When it needs visible existence, first expression comes next.
                        </p>

                        <div className='graphic-empty-world__confirmation-actions'>
                            <button
                                type='button'
                                className='graphic-empty-world__primary'
                                data-testid='graphic-composition-begin-expression'
                                onPointerDown={stopCanvasPropagation}
                                onClick={(event) => {
                                    stopCanvasPropagation(event);
                                    handleBeginFirstExpression();
                                }}>
                                Give this Composition visible existence
                            </button>
                            <button
                                type='button'
                                className='graphic-empty-world__secondary'
                                data-testid='graphic-composition-reset'
                                onPointerDown={stopCanvasPropagation}
                                onClick={(event) => {
                                    stopCanvasPropagation(event);
                                    setCompositionStarterId(null);
                                    setSelectedStarterId(null);
                                }}>
                                Choose another direction
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className='graphic-empty-world__confirmation'
                        data-testid='graphic-empty-world-confirmation'>
                        <div className={`graphic-empty-world__confirmation-mark is-${selectedStarter.accent}`}>
                            <DirectionGlyph accent={selectedStarter.accent} />
                        </div>
                        <div className='graphic-empty-world__copy'>
                            <p className='graphic-empty-world__eyebrow'>Communication direction selected</p>
                            <h1>Begin a {selectedStarter.compositionLabel}.</h1>
                            <p className='graphic-empty-world__subtitle'>
                                Your communication now has a direction.
                            </p>
                            <p className='graphic-empty-world__supporting'>
                                Compositions organize visual communication before any artboard or object appears.
                            </p>
                        </div>
                        <div className='graphic-empty-world__confirmation-actions'>
                            <button
                                type='button'
                                className='graphic-empty-world__secondary'
                                data-testid='graphic-empty-world-back'
                                onPointerDown={stopCanvasPropagation}
                                onClick={(event) => {
                                    stopCanvasPropagation(event);
                                    setSelectedStarterId(null);
                                }}>
                                Choose another direction
                            </button>
                            <button
                                type='button'
                                className='graphic-empty-world__primary'
                                data-testid='graphic-empty-world-begin-composition'
                                onPointerDown={stopCanvasPropagation}
                                onClick={(event) => {
                                    stopCanvasPropagation(event);
                                    handleBeginComposition();
                                }}>
                                Begin Composition
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
