'use client';

/**
 * Read-only list of timeline events (debug / inspection).
 */
export default function TimelineEventLog({ timeline }) {
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
