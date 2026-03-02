'use client';

import { canvasBus } from './eventBus/canvasBus.js';
import { historyIntentRedo, historyIntentUndo } from '@/ui/history/historyIntent.js';

export function Controls({ profile = 'design' }) {
    const isUXMode = profile === 'ux-validation';
    const disabledTooltip = isUXMode ? 'Disabled in UX Mode (validation only)' : undefined;

    const renderControl = (label, onClick, disabled = false) => {
        if (!isUXMode) {
            return (
                <button onClick={onClick} disabled={disabled}>
                    {label}
                </button>
            );
        }

        return (
            <span title={disabledTooltip} tabIndex={0} style={{ display: 'inline-flex' }}>
                <button disabled aria-disabled="true">
                    {label}
                </button>
            </span>
        );
    };

    const handleResetView = () => {
        canvasBus.emit('intent.viewport.reset', {});
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 10,
                right: 10,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                zIndex: 50,
            }}
        >
            {renderControl('Undo', () => historyIntentUndo())}
            {renderControl('Redo', () => historyIntentRedo())}
            {renderControl('Reset View', handleResetView)}
        </div>
    );
}
