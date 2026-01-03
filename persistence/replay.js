import { perfStart, perfEnd } from '@/perf/perfTracker';

export function replayBranch(branch, applyEvent, initialState) {
    perfStart('replay');
    let state = initialState;

    branch.events.forEach((evt) => {
        state = applyEvent(state, evt);
    });

    const t = perfEnd('replay');
    console.log('Replay ms:', t?.toFixed(2), 'events:', branch.events.length);
    return state;
}
