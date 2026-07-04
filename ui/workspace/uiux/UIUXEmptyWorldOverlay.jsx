'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent.js';
import {
    buildUIUXEmptyWorldStarterActivation,
    getUIUXEmptyWorldStarters,
    shouldShowUIUXEmptyWorld,
} from './uiuxEmptyWorldExpression.js';

function StarterGlyph({ starter }) {
    if (starter.id === 'blankPage') {
        return (
            <svg viewBox='0 0 48 48' aria-hidden='true'>
                <circle cx='24' cy='24' r='20' fill='rgba(124, 58, 237, 0.12)' stroke='currentColor' strokeWidth='1.5' />
                <path d='M24 16v16M16 24h16' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
            </svg>
        );
    }

    if (starter.id === 'landingPage') {
        return (
            <svg viewBox='0 0 48 48' aria-hidden='true'>
                <rect x='7' y='10' width='34' height='28' rx='6' fill='rgba(59, 130, 246, 0.12)' stroke='currentColor' strokeWidth='1.5' />
                <path d='M12 16h24M14 23h9v8h-9zM27 23h7M27 28h7M12 35h12M27 35h8' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
        );
    }

    if (starter.id === 'dashboard') {
        return (
            <svg viewBox='0 0 48 48' aria-hidden='true'>
                <rect x='7' y='10' width='34' height='28' rx='6' fill='rgba(20, 184, 166, 0.12)' stroke='currentColor' strokeWidth='1.5' />
                <path d='M14 31V21M20 31V17M26 31v-6M32 31V19M13 32h22M14 16h8M26 16h8' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
        );
    }

    if (starter.id === 'login') {
        return (
            <svg viewBox='0 0 48 48' aria-hidden='true'>
                <rect x='10' y='12' width='28' height='24' rx='6' fill='rgba(124, 58, 237, 0.12)' stroke='currentColor' strokeWidth='1.5' />
                <path d='M18 19h12M18 24h12M18 30h8' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
                <path d='M29 13v-1a5 5 0 10-10 0v1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
        );
    }

    return (
        <svg viewBox='0 0 48 48' aria-hidden='true'>
            <rect x='9' y='10' width='30' height='28' rx='6' fill='rgba(245, 158, 11, 0.12)' stroke='currentColor' strokeWidth='1.5' />
            <path d='M24 18.2l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5L24 18.2z' stroke='currentColor' strokeWidth='1.5' strokeLinejoin='round' fill='none' />
        </svg>
    );
}

function OrbitBadge() {
    return (
        <div className='uiux-empty-world__badge' aria-hidden='true'>
            <div className='uiux-empty-world__badge-orbit' />
            <div className='uiux-empty-world__badge-core'>
                <svg viewBox='0 0 48 48'>
                    <path d='M24 14v20M14 24h20' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                    <rect x='12' y='12' width='24' height='24' rx='6' fill='none' stroke='currentColor' strokeWidth='1.5' />
                </svg>
            </div>
        </div>
    );
}

export function UIUXEmptyWorldOverlay({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
    worldHistory = null,
}) {
    const emptyWorldVisible = shouldShowUIUXEmptyWorld({
        workspaceId,
        modeId,
        nodeCount,
        worldHistory,
    });
    const starters = useMemo(() => getUIUXEmptyWorldStarters(), []);
    const [selectedStarterId, setSelectedStarterId] = useState(null);
    const [isArrivalActive, setIsArrivalActive] = useState(false);
    const arrivalTimeoutRef = useRef(null);
    const selectedStarter = useMemo(
        () => starters.find((starter) => starter.id === selectedStarterId) ?? null,
        [selectedStarterId, starters],
    );

    useEffect(() => {
        return () => {
            if (arrivalTimeoutRef.current != null) {
                window.clearTimeout(arrivalTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (emptyWorldVisible || !selectedStarterId) return;
        if (isArrivalActive) return;

        setIsArrivalActive(true);
        arrivalTimeoutRef.current = window.setTimeout(() => {
            setIsArrivalActive(false);
            setSelectedStarterId(null);
            arrivalTimeoutRef.current = null;
        }, 900);
    }, [emptyWorldVisible, isArrivalActive, selectedStarterId]);

    const handleCreate = useCallback((starterId) => {
        if (arrivalTimeoutRef.current != null) {
            window.clearTimeout(arrivalTimeoutRef.current);
            arrivalTimeoutRef.current = null;
        }
        setSelectedStarterId(starterId);
        setIsArrivalActive(false);
        const activation = buildUIUXEmptyWorldStarterActivation(starterId);
        nodeCreateIntent(activation.createIntent);
        if (activation.selectionIntent) {
            canvasBus.emit('intent.selection.set', activation.selectionIntent);
        }
    }, []);
    const stopCanvasPropagation = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    if (!emptyWorldVisible && !isArrivalActive) return null;

    const worldState = isArrivalActive ? 'arriving' : 'empty';

    return (
        <div
            className='uiux-empty-world'
            data-testid='uiux-empty-world'
            data-world-state={worldState}>
            <div className='uiux-empty-world__center'>
                <OrbitBadge />
                <div className='uiux-empty-world__copy'>
                    <h1 data-testid='uiux-empty-world-title'>
                        {isArrivalActive ? (
                            <>
                                Your <span>{selectedStarter?.title ?? 'Page'}</span> is arriving
                            </>
                        ) : (
                            <>
                                Design an <span>Application</span>
                            </>
                        )}
                    </h1>
                    <p className='uiux-empty-world__subtitle'>
                        {isArrivalActive ? 'The world is responding to your direction.' : 'Everything starts with a Page.'}
                    </p>
                    <p className='uiux-empty-world__supporting'>
                        {isArrivalActive
                            ? 'Stay with the same world while your first project takes shape.'
                            : 'Choose a starting point or create a blank Page.'}
                    </p>
                </div>

                {isArrivalActive ? (
                    <div
                        className='uiux-empty-world__arrival'
                        data-testid='uiux-creative-arrival'
                        aria-live='polite'>
                        <div className={`uiux-empty-world__arrival-chip is-${selectedStarter?.accent ?? 'violet'}`}>
                            <StarterGlyph starter={selectedStarter ?? starters[0]} />
                            <div className='uiux-empty-world__arrival-copy'>
                                <strong>{selectedStarter?.label ?? 'Blank Page'}</strong>
                                <span>Your decision is becoming the first place your Application can live.</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='uiux-empty-world__cards' data-testid='uiux-empty-world-cards'>
                        {starters.map((starter) => (
                            <button
                                key={starter.id}
                                type='button'
                                className={`uiux-empty-world__card is-${starter.accent}`}
                                data-testid={`uiux-empty-world-card-${starter.id}`}
                                onPointerDown={stopCanvasPropagation}
                                onClick={(event) => {
                                    stopCanvasPropagation(event);
                                    handleCreate(starter.id);
                                }}>
                                <div className='uiux-empty-world__card-icon'>
                                    <StarterGlyph starter={starter} />
                                </div>
                                <div className='uiux-empty-world__card-title'>{starter.label}</div>
                                <div className='uiux-empty-world__card-description'>{starter.description}</div>
                            </button>
                        ))}
                    </div>
                )}

                {isArrivalActive ? (
                    <p className='uiux-empty-world__guidance' data-testid='uiux-empty-world-guidance'>
                        <span className='uiux-empty-world__guidance-mark'>✦</span>
                        Guidance is yielding to your project.
                    </p>
                ) : (
                    <p className='uiux-empty-world__guidance' data-testid='uiux-empty-world-guidance'>
                        <span className='uiux-empty-world__guidance-mark'>✦</span>
                        These are suggestions. You can change direction anytime.
                    </p>
                )}

                {!isArrivalActive ? (
                    <button
                        type='button'
                        className='uiux-empty-world__intro'
                        data-testid='uiux-empty-world-intro'
                        aria-label='New to Dropple? See how it works in 90 seconds.'
                        onPointerDown={stopCanvasPropagation}
                        onClick={stopCanvasPropagation}>
                        <span className='uiux-empty-world__intro-play' aria-hidden='true'>
                            ▶
                        </span>
                        <span>
                            <strong>New to Dropple?</strong>
                            <small>See how it works in 90 seconds.</small>
                        </span>
                    </button>
                ) : null}
            </div>
        </div>
    );
}
