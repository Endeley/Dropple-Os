'use client';

export function ContextMenu({ x, y, items, onClose }) {
    return (
        <div
            role="menu"
            style={{
                position: 'fixed',
                left: x,
                top: y,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: 4,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                zIndex: 1000,
                minWidth: 180,
            }}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {items.map((item, i) => {
                if (item.type === 'separator') {
                    return (
                        <div
                            key={`sep-${i}`}
                            aria-hidden
                            style={{
                                height: 1,
                                margin: '4px 6px',
                                background: '#e5e7eb',
                            }}
                        />
                    );
                }

                return (
                    <button
                        key={item.key || i}
                        role="menuitem"
                        disabled={item.disabled}
                        onClick={() => {
                            item.onClick?.();
                            onClose();
                        }}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '6px 8px',
                            fontSize: 13,
                            borderRadius: 4,
                            background: 'transparent',
                            border: 'none',
                            cursor: item.disabled ? 'default' : 'pointer',
                            opacity: item.disabled ? 0.4 : 1,
                        }}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
