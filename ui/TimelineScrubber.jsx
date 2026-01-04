'use client';

import { scrubToTime } from '@/timeline/timelineScrubber.js';
import { dispatcher } from '@/ui/interaction/dispatcher.js';

export function TimelineScrubber() {
    const doc = { branches: { main: { events: [], checkpoints: [] } } }; // placeholder document
    const branchId = 'main';

    function onChange(e) {
        const time = Number(e.target.value);
        // TODO: wire real doc/branch; this is placeholder for now
        scrubToTime({
            doc,
            branchId,
            time,
        });
    }

    return (
        <input
            type="range"
            min={0}
            max={5000}
            step={10}
            onChange={onChange}
        />
    );
}
