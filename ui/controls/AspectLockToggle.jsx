'use client';

export function AspectLockToggle({ locked, onToggle }) {
    return (
        <button
            onClick={onToggle}
            title={locked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            style={{
                fontSize: 12,
                padding: '2px 6px',
                borderRadius: 4,
                border: '1px solid #e5e7eb',
                background: locked ? '#e0f2fe' : '#fff',
                cursor: 'pointer',
            }}
        >
            {locked ? 'Lock' : 'Unlock'}
        </button>
    );
}
