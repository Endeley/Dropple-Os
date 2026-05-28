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

test('sequence clip move-trim is deterministic and undo-redo lawful in animation mode', async () => {
    const dispatcher = createEventDispatcher({ headless: true });
    dispatcher.hydrateRuntimeState(structuredClone(initialRuntimeState), { animate: false });

    await dispatcher.dispatch({
        type: EventTypes.WORKSPACE_SET_ACTIVE,
        payload: {
            workspaceDef: adaptWorkspaceToContractV1({
                ...mediaWorkspace,
                modeId: 'animation',
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CREATE,
        payload: {
            sequence: createSequence({
                id: 'anim-sequence',
                label: 'Animation Clip Flow',
                duration: 240,
                frameRate: 24,
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_TRACK_CREATE,
        payload: {
            sequenceId: 'anim-sequence',
            track: createSequenceTrack({
                id: 'anim-track',
                type: 'shot',
                label: 'Anim Track',
                order: 0,
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CLIP_CREATE,
        payload: {
            sequenceId: 'anim-sequence',
            trackId: 'anim-track',
            clip: createSequenceClip({
                id: 'anim-clip-a',
                start: 12,
                end: 36,
            }),
        },
    });

    const baseline =
        dispatcher.getState().document.sequences.sequences['anim-sequence'].tracks['anim-track']
            .clips['anim-clip-a'];
    assert.equal(baseline.start, 12);
    assert.equal(baseline.end, 36);

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CLIP_MOVE,
        payload: {
            sequenceId: 'anim-sequence',
            trackId: 'anim-track',
            clipId: 'anim-clip-a',
            start: 13,
            end: 37,
        },
    });

    const afterMove =
        dispatcher.getState().document.sequences.sequences['anim-sequence'].tracks['anim-track']
            .clips['anim-clip-a'];
    assert.equal(afterMove.start, 13);
    assert.equal(afterMove.end, 37);

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CLIP_TRIM,
        payload: {
            sequenceId: 'anim-sequence',
            trackId: 'anim-track',
            clipId: 'anim-clip-a',
            end: 38,
        },
    });

    const afterTrim =
        dispatcher.getState().document.sequences.sequences['anim-sequence'].tracks['anim-track']
            .clips['anim-clip-a'];
    assert.equal(afterTrim.start, 13);
    assert.equal(afterTrim.end, 38);

    dispatcher.undo();
    const afterUndoTrim =
        dispatcher.getState().document.sequences.sequences['anim-sequence'].tracks['anim-track']
            .clips['anim-clip-a'];
    assert.equal(afterUndoTrim.start, 13);
    assert.equal(afterUndoTrim.end, 37);

    dispatcher.undo();
    const afterUndoMove =
        dispatcher.getState().document.sequences.sequences['anim-sequence'].tracks['anim-track']
            .clips['anim-clip-a'];
    assert.equal(afterUndoMove.start, 12);
    assert.equal(afterUndoMove.end, 36);

    dispatcher.redo();
    const afterRedoMove =
        dispatcher.getState().document.sequences.sequences['anim-sequence'].tracks['anim-track']
            .clips['anim-clip-a'];
    assert.equal(afterRedoMove.start, 13);
    assert.equal(afterRedoMove.end, 37);

    dispatcher.redo();
    const afterRedoTrim =
        dispatcher.getState().document.sequences.sequences['anim-sequence'].tracks['anim-track']
            .clips['anim-clip-a'];
    assert.equal(afterRedoTrim.start, 13);
    assert.equal(afterRedoTrim.end, 38);
});
