import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { adaptWorkspaceToContractV1 } from '@/core/contracts/adaptWorkspaceToContractV1.js';
import { mediaWorkspace } from '@/workspaces/registry/mediaWorkspace.js';
import {
    createSequence,
    createSequenceClip,
    createSequenceTrack,
} from '@/runtime/sequencer/sequenceRegistry.js';

test('sequence events persist through the live dispatcher path in media workspace', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(structuredClone(initialRuntimeState), { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: adaptWorkspaceToContractV1(mediaWorkspace),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CREATE,
        payload: {
            sequence: createSequence({
                id: 'fight-sequence',
                label: 'Fight Intro',
                duration: 240,
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_TRACK_CREATE,
        payload: {
            sequenceId: 'fight-sequence',
            track: createSequenceTrack({
                id: 'camera-track',
                type: 'camera',
                label: 'Camera Track',
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CLIP_CREATE,
        payload: {
            sequenceId: 'fight-sequence',
            trackId: 'camera-track',
            clip: createSequenceClip({
                id: 'cam-a',
                start: 0,
                end: 120,
                cameraNodeRef: 'camera-a',
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_SET_ACTIVE,
        payload: {
            sequenceId: 'fight-sequence',
        },
    });

    const next = dispatcher.getState();

    assert.equal(next.document.sequences.activeSequenceId, 'fight-sequence');
    assert.ok(next.document.sequences.sequences['fight-sequence']);
    assert.ok(next.document.sequences.sequences['fight-sequence'].tracks['camera-track']);
    assert.ok(
        next.document.sequences.sequences['fight-sequence'].tracks['camera-track'].clips['cam-a']
    );
});
