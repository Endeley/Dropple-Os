'use client';

/**
 * Visual-only keyframe handle.
 * No mutation here; wiring for edit can be added later.
 */
export function EditableKeyframe({ keyframe, duration = 1 }) {
    if (!keyframe) return null;
    const pct = duration ? (keyframe.time / duration) * 100 : 0;
    const id = keyframe.id || `${keyframe.time}-${keyframe.value}`;

    return (
        <div
            key={id}
            title={`t=${keyframe.time}ms`}
            style={{
                position: 'absolute',
                left: `${pct}%`,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#2563eb',
                transform: 'translate(-50%, 4px)',
                cursor: 'pointer',
            }}
        />
    );
}
