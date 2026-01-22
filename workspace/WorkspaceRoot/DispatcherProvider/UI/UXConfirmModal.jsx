'use client';

import { useEffect, useRef, useState } from 'react';
import {
    respondUXConfirmation,
    subscribeUXConfirmRequests,
} from '@/runtime/dispatcher/ux/uxConfirmBus.js';

const TITLE_COPY = 'Confirm Structural Change';
const BODY_COPY =
    'This action performs a structural change while in UX Validation Mode.';

export function UXConfirmModal() {
    const [actionType, setActionType] = useState(null);
    const confirmRef = useRef(null);
    const cancelRef = useRef(null);

    useEffect(() => {
        return subscribeUXConfirmRequests((event) => {
            setActionType(event?.actionType ?? null);
        });
    }, []);

    useEffect(() => {
        if (!actionType) return;
        confirmRef.current?.focus();
    }, [actionType]);

    useEffect(() => {
        if (!actionType) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                handleResponse(false);
            }

            if (event.key !== 'Tab') return;

            const focusable = [confirmRef.current, cancelRef.current].filter(Boolean);
            if (!focusable.length) return;

            const currentIndex = focusable.indexOf(document.activeElement);
            const nextIndex = event.shiftKey
                ? (currentIndex + focusable.length - 1) % focusable.length
                : (currentIndex + 1) % focusable.length;

            event.preventDefault();
            focusable[nextIndex]?.focus();
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [actionType]);

    const handleResponse = (confirmed) => {
        if (!actionType) return;
        respondUXConfirmation({ actionType, confirmed });
        setActionType(null);
    };

    if (!actionType) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(18, 18, 18, 0.4)',
                zIndex: 1200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}>
            <div
                role='dialog'
                aria-modal='true'
                aria-labelledby='ux-confirm-title'
                aria-describedby='ux-confirm-body'
                style={{
                    width: 'min(420px, 92vw)',
                    borderRadius: 12,
                    border: '1px solid #E7E2D8',
                    background: '#FFF9F1',
                    color: '#2B2116',
                    boxShadow: '0 18px 40px rgba(0, 0, 0, 0.18)',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                }}>
                <div
                    id='ux-confirm-title'
                    style={{
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: '0.01em',
                    }}>
                    {TITLE_COPY}
                </div>
                <div
                    id='ux-confirm-body'
                    style={{
                        fontSize: 13,
                        lineHeight: 1.4,
                        color: '#4B3A26',
                    }}>
                    {BODY_COPY}
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 10,
                        marginTop: 8,
                    }}>
                    <button
                        ref={cancelRef}
                        type='button'
                        onClick={() => handleResponse(false)}
                        style={{
                            borderRadius: 8,
                            border: '1px solid #D8CCBA',
                            background: '#FFFDF8',
                            color: '#5D4A33',
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '6px 12px',
                            cursor: 'pointer',
                        }}>
                        Cancel
                    </button>
                    <button
                        ref={confirmRef}
                        type='button'
                        onClick={() => handleResponse(true)}
                        style={{
                            borderRadius: 8,
                            border: '1px solid #C7A871',
                            background: '#F7E1B6',
                            color: '#4A361C',
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '6px 12px',
                            cursor: 'pointer',
                        }}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
