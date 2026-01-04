'use client';

import { dispatcher } from './interaction/dispatcher.js';

export function Controls() {
    return (
        <div
            style={{ position: 'fixed', top: 10, right: 10, display: 'flex', gap: 8, alignItems: 'center' }}
        >
            <button onClick={() => dispatcher.undo()}>Undo</button>
            <button onClick={() => dispatcher.redo()}>Redo</button>
        </div>
    );
}
