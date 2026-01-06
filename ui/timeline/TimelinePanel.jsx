'use client';

import { useEffect } from 'react';
import { useTimelineStore } from './useTimelineStore.js';
import { applyTimelinePreview } from './applyTimelinePreview.js';
import TimelineScrubber from './TimelineScrubber.jsx';
import TimelineEventLog from './TimelineEventLog.jsx';

export default function TimelinePanel({ timeline }) {
    const { currentTime, duration, setTime } = useTimelineStore();

    useEffect(() => {
        if (!timeline) return;
        applyTimelinePreview({
            timeline,
            time: currentTime,
        });
    }, [timeline, currentTime]);

    useEffect(() => {
        if (timeline?.duration != null) {
            setTime(Math.min(currentTime, timeline.duration));
        }
    }, [timeline?.duration]);

    if (!timeline) return null;

    const panelDuration = timeline.duration || duration;

    return (
        <div
            style={{
                borderTop: '1px solid #e5e7eb',
                background: '#fafafa',
            }}
        >
            <TimelineScrubber duration={panelDuration} />
            <TimelineEventLog timeline={timeline} />
        </div>
    );
}
