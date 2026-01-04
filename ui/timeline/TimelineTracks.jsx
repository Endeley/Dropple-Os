'use client';

/**
 * Simple read-only list of timeline events.
 */
export default function TimelineTracks({ timeline }) {
    if (!timeline?.events) return null;

    return (
        <div style={{ padding: 8 }}>
            {timeline.events.map((evt) => (
                <div
                    key={evt.id || `${evt.type}-${evt.time}`}
                    style={{
                        fontSize: 12,
                        padding: '4px 0',
                        opacity: 0.7,
                    }}
                >
                    [{evt.time}ms] {evt.type}
                </div>
            ))}
        </div>
    );
}
