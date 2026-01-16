'use client';

export function SelectionBox({ bounds, onMoveStart, onResizeStart }) {
    if (!bounds) return null;

    function handleMoveStart(e) {
        e.preventDefault();
        e.stopPropagation();
        onMoveStart?.(e);
    }

    function handleResizeStart(e) {
        e.preventDefault();
        e.stopPropagation();
        onResizeStart?.(e);
    }

    return (
        <div
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
                onPointerDown={handleResizeStart}
                style={{
                    position: 'absolute',
                    right: -4,
                    bottom: -4,
                    width: 8,
                    height: 8,
                    background: '#2563eb',
                    borderRadius: 2,
                    cursor: 'se-resize',
                }}
            />
        </div>
    );
}
