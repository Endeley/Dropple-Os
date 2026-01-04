'use client';

import { useEffect } from 'react';
import CanvasRoot from '@/ui/canvas/CanvasRoot.jsx';
import { EventTypes } from '@/core/events/eventTypes.js';
import { dispatcher } from '@/ui/interaction/dispatcher.js';
import { Controls } from '@/ui/Controls.jsx';
import '@/ui/interaction/sessionBinding.js';

function useSeedSample(dispatcher) {
    return () => {
        const nodes = [
            { id: 'n1', x: 40, y: 40, width: 140, height: 90 },
            { id: 'n2', x: 220, y: 120, width: 160, height: 110 },
            { id: 'n3', x: 120, y: 260, width: 130, height: 100 },
        ];

        nodes.forEach((node) =>
            dispatcher.dispatch({
                type: EventTypes.NODE_CREATE,
                payload: { node },
            })
        );
    };
}

export default function WorkspacePage() {
    const dispatcherInstance = dispatcher;
    const seed = useSeedSample(dispatcherInstance);

    useEffect(() => {
        const state = dispatcherInstance.getState?.();
        if (!state?.rootIds || state.rootIds.length === 0) {
            seed();
        }
    }, [dispatcherInstance, seed]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    padding: 12,
                    borderBottom: '1px solid #e5e7eb',
                    background: '#f8fafc',
                }}
            >
                <button
                    onClick={seed}
                    style={{
                        padding: '6px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: 4,
                        background: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Seed nodes
                </button>
                <button
                    onClick={() => dispatcher.undo()}
                    style={{
                        padding: '6px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: 4,
                        background: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Undo
                </button>
                <button
                    onClick={() => dispatcher.redo()}
                    style={{
                        padding: '6px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: 4,
                        background: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Redo
                </button>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
                <CanvasRoot />
                <Controls />
            </div>
        </div>
    );
}
