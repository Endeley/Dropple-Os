'use client';

export function SelectionBox({
    bounds,
    onMoveStart,
    onResizeStart,
    resizeDisabled = false,
    resizeDisabledHint = 'Size controlled by auto-layout container',
}) {
    if (!bounds) return null;

    function handleMoveStart(e) {
        e.preventDefault();
        e.stopPropagation();
        onMoveStart?.(e);
    }

    function handleResizeStart(e, handle) {
        if (resizeDisabled) return;
        e.preventDefault();
        e.stopPropagation();
        onResizeStart?.(e, { handle });
    }

    return (
        <div
            data-testid="selection-box"
            onPointerDown={handleMoveStart}
            style={{
                position: 'absolute',
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
                border: '1px dashed #2563eb',
                boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.25)',
                pointerEvents: 'auto',
                cursor: 'move',
                zIndex: 5,
            }}>
            <div
                data-testid="selection-box-resize-handle"
                data-resize-handle="se"
                onPointerDown={(e) => handleResizeStart(e, 'se')}
                style={{
                    position: 'absolute',
                    right: -6,
                    bottom: -6,
                    width: 12,
                    height: 12,
                    background: resizeDisabled ? '#94a3b8' : '#2563eb',
                    borderRadius: 2,
                    cursor: resizeDisabled ? 'not-allowed' : 'se-resize',
                    opacity: resizeDisabled ? 0.7 : 1,
                }}
                title={resizeDisabled ? resizeDisabledHint : undefined}
            />
        </div>
    );
}
