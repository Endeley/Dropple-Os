'use client';

import { dispatcher } from './interaction/dispatcher.js';
import { TimelineScrubber } from './TimelineScrubber.jsx';

export function Controls() {
    return (
        <div
            style={{ position: 'fixed', top: 10, right: 10, display: 'flex', gap: 8, alignItems: 'center' }}
        >
            <button onClick={() => dispatcher.undo()}>Undo</button>
            <button onClick={() => dispatcher.redo()}>Redo</button>
            <TimelineScrubber />
        </div>
    );
}
