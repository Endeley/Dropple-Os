import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState, __resetRuntimeStateInternal } from '@/runtime/state/runtimeState.internal.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';

function resetProjectionStore() {
    __resetRuntimeStateInternal();
    useRuntimeStore.setState({
        document: null,
        viewNodes: {},
        viewRootIds: [],
        workspace: null,
        timeline: null,
        playback: { isPlaying: false },
        isReplaying: false,
        uxAudit: [],
        collaboration: { session: null, presence: [], cursors: [] },
        federationAudit: { entries: [], hash: '', maxEntries: 256 },
        events: [],
        cursorIndex: -1,
    });
}

test.beforeEach(resetProjectionStore);

function createAuditAppendEvent(index, maxEntries = 2) {
    return {
        type: EventTypes.FEDERATION_AUDIT_APPEND,
        payload: {
            maxEntries,
            entry: {
                type: 'runtime.federation.audit',
                payload: {
                    eventType: `evt-${index}`,
                    sessionId: 'session-1',
                    outcome: 'accepted',
                    reason: 'ingress-accepted',
                    beforeSignature: `before-${index}`,
                    afterSignature: `after-${index}`,
                    phaseBefore: 'created',
                    phaseAfter: 'preview',
                    epochBefore: index,
                    epochAfter: index + 1,
                },
            },
        },
    };
}

test('federation audit runtime slice is deterministic under replay-equivalent streams', async () => {
    const dispatcherA = createEventDispatcher({ headless: true });
    dispatcherA.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcherA.dispatch(createAuditAppendEvent(0, 8));
    await dispatcherA.dispatch(createAuditAppendEvent(1, 8));
    const projectionA = useRuntimeStore.getState().federationAudit;

    resetProjectionStore();
    const dispatcherB = createEventDispatcher({ headless: true });
    dispatcherB.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcherB.dispatch(createAuditAppendEvent(0, 8));
    await dispatcherB.dispatch(createAuditAppendEvent(1, 8));
    const projectionB = useRuntimeStore.getState().federationAudit;

    assert.deepEqual(projectionA, projectionB);
    assert.equal(typeof projectionA.hash, 'string');
    assert.equal(projectionA.hash.length > 0, true);
});

test('federation audit runtime slice enforces deterministic ring buffer bounds', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    await dispatcher.dispatch(createAuditAppendEvent(0, 2));
    await dispatcher.dispatch(createAuditAppendEvent(1, 2));
    await dispatcher.dispatch(createAuditAppendEvent(2, 2));

    const projection = useRuntimeStore.getState().federationAudit;
    assert.equal(projection.entries.length, 2);
    assert.equal(projection.entries[0]?.payload?.eventType, 'evt-1');
    assert.equal(projection.entries[1]?.payload?.eventType, 'evt-2');
    assert.equal(projection.maxEntries, 2);
});

test('federation audit runtime events do not mutate canonical document truth', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(initialRuntimeState, { animate: false });
    const before = getRuntimeState().document;

    await dispatcher.dispatch(createAuditAppendEvent(0, 4));
    await dispatcher.dispatch(createAuditAppendEvent(1, 4));

    const after = getRuntimeState().document;
    assert.deepEqual(after, before);
});
