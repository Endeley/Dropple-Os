'use client';

import { useEffect, useState } from 'react';
import { subscribeUXWarnings } from '@/runtime/dispatcher/ux/uxWarningBus.js';

const BANNER_COPY =
    'This action performs a structural change while in UX Validation Mode.';

export function UXWarningBanner() {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        return subscribeUXWarnings((event) => {
            if (dismissed) return;
            if (event?.severity !== 'warning') return;
            setVisible(true);
        });
    }, [dismissed]);

    if (!visible || dismissed) return null;

    return (
        <div
            role='status'
            aria-live='polite'
            style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #F4D8A3',
                background: '#FFF7E6',
                color: '#8A5A10',
                fontSize: 12,
                fontWeight: 600,
            }}>
            <span>{BANNER_COPY}</span>
            <button
                type='button'
                onClick={() => {
                    setDismissed(true);
                    setVisible(false);
                }}
                style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#8A5A10',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                }}>
                Dismiss
            </button>
        </div>
    );
}
