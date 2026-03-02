'use client';

import { useState } from 'react';
import { useUXWarnings } from '@/ui/interaction/bridges/UXWarningBridge.js';

const BANNER_COPY =
    'This action performs a structural change while in UX Validation Mode.';

export function UXWarningBanner() {
    const warningEvent = useUXWarnings();
    const [dismissed, setDismissed] = useState(false);
    const visible = !dismissed && warningEvent?.severity === 'warning';

    if (!visible) return null;

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
