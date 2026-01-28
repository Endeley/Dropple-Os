'use client';

export function CanvasDebugOverlay({
    viewport,
    bounds,
    cursor,
    zoomTier,
    suggestionsVisible = false,
    onToggleSuggestions,
    validationsVisible = false,
    onToggleValidations,
    onToggle,
    hint = 'Shift+D',
}) {
    if (!viewport || !bounds) return null;

    return (
        <div
            style={{
                position: 'absolute',
                right: 16,
                top: 16,
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#e2e8f0',
                fontSize: 12,
                borderRadius: 8,
                lineHeight: 1.4,
                pointerEvents: 'auto',
                minWidth: 200,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 6 }}>
                <strong style={{ fontSize: 12, letterSpacing: 0.3 }}>World Debug</strong>
                <div style={{ display: 'flex', gap: 6 }}>
                    {onToggleSuggestions && (
                        <button
                            onClick={onToggleSuggestions}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(226,232,240,0.4)',
                                color: '#e2e8f0',
                                borderRadius: 6,
                                fontSize: 10,
                                padding: '2px 6px',
                                cursor: 'pointer',
                            }}
                        >
                            Suggestions {suggestionsVisible ? 'On' : 'Off'}
                        </button>
                    )}
                    {onToggleValidations && (
                        <button
                            onClick={onToggleValidations}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(226,232,240,0.4)',
                                color: '#e2e8f0',
                                borderRadius: 6,
                                fontSize: 10,
                                padding: '2px 6px',
                                cursor: 'pointer',
                            }}
                        >
                            Validation {validationsVisible ? 'On' : 'Off'}
                        </button>
                    )}
                    <button
                        onClick={onToggle}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(226,232,240,0.4)',
                            color: '#e2e8f0',
                            borderRadius: 6,
                            fontSize: 10,
                            padding: '2px 6px',
                            cursor: 'pointer',
                        }}
                    >
                        Hide ({hint})
                    </button>
                </div>
            </div>
            <div>Camera: {viewport.x.toFixed(2)}, {viewport.y.toFixed(2)}</div>
            <div>Zoom: {viewport.scale.toFixed(3)}x</div>
            <div>Tier: {zoomTier}</div>
            <div>
                Viewport: {bounds.minX.toFixed(1)}, {bounds.minY.toFixed(1)} →{' '}
                {bounds.maxX.toFixed(1)}, {bounds.maxY.toFixed(1)}
            </div>
            <div>
                Cursor: {cursor ? `${cursor.x.toFixed(1)}, ${cursor.y.toFixed(1)}` : '—'}
            </div>
        </div>
    );
}
