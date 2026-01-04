// bench/engineBench.js
import { performance } from 'node:perf_hooks';
import { createEventDispatcher } from '../runtime/dispatcher/dispatch.js';
import { EventTypes } from '../core/events/eventTypes.js';
import { replayBranch } from '../persistence/replay.js';
import { applyEvent } from '../core/events/applyEvent.js';

// Polyfill browser APIs for Node benchmark
globalThis.performance = performance;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

const dispatcher = createEventDispatcher();

function time(label, fn) {
    const t0 = performance.now();
    const result = fn();
    const t = performance.now() - t0;
    console.log(`${label}: ${t.toFixed(2)} ms`);
    return result;
}

function seedNodes(count) {
    time(`Seed ${count} nodes`, () => {
        for (let i = 0; i < count; i++) {
            dispatcher.dispatch({
                type: EventTypes.NODE_CREATE,
                payload: {
                    node: {
                        id: `n${i}`,
                        x: i * 10,
                        y: i * 10,
                        width: 100,
                        height: 100,
                    },
                },
            });
        }
    });
}

function measureMove(id, coords) {
    time(`Move ${id}`, () => {
        dispatcher.dispatch({
            type: EventTypes.NODE_MOVE,
            payload: {
                id,
                xDelta: coords.x,
                yDelta: coords.y,
            },
        });
    });
}

function measureReplay(eventCount) {
    const events = [];
    for (let i = 0; i < eventCount; i++) {
        events.push({
            type: EventTypes.NODE_MOVE,
            payload: {
                id: 'n0',
                xDelta: 1,
                yDelta: 1,
            },
        });
    }

    const branch = { events };
    const initialState = undefined; // applyEvent has its own default initial state

    time(`Replay ${eventCount} events`, () => {
        replayBranch(branch, applyEvent, initialState);
    });
}

function measureUndoRedo() {
    time('Undo', () => dispatcher.undo());
    time('Redo', () => dispatcher.redo());
}

function main() {
    const NODE_COUNT = 1000;
    const REPLAY_EVENTS = 2000;

    seedNodes(NODE_COUNT);
    measureMove('n500', { x: 50, y: -25 });
    measureUndoRedo();
    measureReplay(REPLAY_EVENTS);
}

main();
