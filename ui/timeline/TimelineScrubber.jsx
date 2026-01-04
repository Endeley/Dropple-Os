'use client';

import { useTimelineStore } from './useTimelineStore.js';

export default function TimelineScrubber({ duration }) {
    const { currentTime, setTime, startScrub, endScrub } = useTimelineStore();

    return (
        <div
            style={{
                padding: 8,
                borderTop: '1px solid #e5e7eb',
                background: '#f8fafc',
            }}
        >
            <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onMouseDown={startScrub}
                onMouseUp={endScrub}
                onChange={(e) => setTime(Number(e.target.value))}
                style={{ width: '100%' }}
            />
            <div style={{ fontSize: 12, marginTop: 4 }}>
                Time: {currentTime} ms / {duration} ms
            </div>
        </div>
    );
}
