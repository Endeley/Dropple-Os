'use client';

import { EditableKeyframe } from './EditableKeyframe.jsx';

/**
 * Renders a single animation's keyframes over the timeline duration.
 * Visual-only; no mutations.
 */
export function TimelineTrack({ animation, duration = 1 }) {
    if (!animation) return null;

    return (
        <div
            style={{
                position: 'relative',
                height: 24,
                background: '#f1f5f9',
                marginBottom: 6,
                borderRadius: 4,
            }}
        >
            {animation.keyframes.map((kf) => (
                <EditableKeyframe key={kf.id || `${animation.id}-${kf.time}`} keyframe={kf} duration={duration} />
            ))}
        </div>
    );
}
