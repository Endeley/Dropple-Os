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

test('sequence clip move-trim supports keyboard-step parity (+/-10) and remains undo-redo lawful', async () => {
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
                id: 'anim-sequence-step',
                label: 'Animation Keyboard Step',
                duration: 300,
                frameRate: 24,
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_TRACK_CREATE,
        payload: {
            sequenceId: 'anim-sequence-step',
            track: createSequenceTrack({
                id: 'anim-track-step',
                type: 'shot',
                label: 'Anim Track',
                order: 0,
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CLIP_CREATE,
        payload: {
            sequenceId: 'anim-sequence-step',
            trackId: 'anim-track-step',
            clip: createSequenceClip({
                id: 'anim-clip-step',
                start: 40,
                end: 64,
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CLIP_MOVE,
        payload: {
            sequenceId: 'anim-sequence-step',
            trackId: 'anim-track-step',
            clipId: 'anim-clip-step',
            start: 50,
            end: 74,
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CLIP_TRIM,
        payload: {
            sequenceId: 'anim-sequence-step',
            trackId: 'anim-track-step',
            clipId: 'anim-clip-step',
            end: 84,
        },
    });

    const afterKeyboardParity =
        dispatcher.getState().document.sequences.sequences['anim-sequence-step'].tracks[
            'anim-track-step'
        ].clips['anim-clip-step'];
    assert.equal(afterKeyboardParity.start, 50);
    assert.equal(afterKeyboardParity.end, 84);

    dispatcher.undo();
    const undoTrim =
        dispatcher.getState().document.sequences.sequences['anim-sequence-step'].tracks[
            'anim-track-step'
        ].clips['anim-clip-step'];
    assert.equal(undoTrim.start, 50);
    assert.equal(undoTrim.end, 74);

    dispatcher.undo();
    const undoMove =
        dispatcher.getState().document.sequences.sequences['anim-sequence-step'].tracks[
            'anim-track-step'
        ].clips['anim-clip-step'];
    assert.equal(undoMove.start, 40);
    assert.equal(undoMove.end, 64);

    dispatcher.redo();
    dispatcher.redo();
    const redoFinal =
        dispatcher.getState().document.sequences.sequences['anim-sequence-step'].tracks[
            'anim-track-step'
        ].clips['anim-clip-step'];
    assert.equal(redoFinal.start, 50);
    assert.equal(redoFinal.end, 84);
});

test('sequence clip split is deterministic and undo-redo lawful in animation mode', async () => {
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
                id: 'anim-sequence-split',
                label: 'Animation Split',
                duration: 240,
                frameRate: 24,
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_TRACK_CREATE,
        payload: {
            sequenceId: 'anim-sequence-split',
            track: createSequenceTrack({
                id: 'anim-track-split',
                type: 'shot',
                label: 'Anim Track',
                order: 0,
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CLIP_CREATE,
        payload: {
            sequenceId: 'anim-sequence-split',
            trackId: 'anim-track-split',
            clip: createSequenceClip({
                id: 'anim-clip-split',
                start: 10,
                end: 40,
            }),
        },
    });

    await dispatcher.dispatch({
        type: EventTypes.SEQUENCE_CLIP_SPLIT,
        payload: {
            sequenceId: 'anim-sequence-split',
            trackId: 'anim-track-split',
            clipId: 'anim-clip-split',
            splitAt: 25,
            rightClipId: 'anim-clip-split-r',
        },
    });

    const splitTrack =
        dispatcher.getState().document.sequences.sequences['anim-sequence-split'].tracks[
            'anim-track-split'
        ];
    const splitClips = Object.values(splitTrack.clips ?? {});
    assert.equal(splitClips.length, 2);
    assert.equal(splitClips[0].start, 10);
    assert.equal(splitClips[0].end, 25);
    assert.equal(splitClips[1].start, 25);
    assert.equal(splitClips[1].end, 40);

    dispatcher.undo();
    const afterUndoTrack =
        dispatcher.getState().document.sequences.sequences['anim-sequence-split'].tracks[
            'anim-track-split'
        ];
    const afterUndoClips = Object.values(afterUndoTrack.clips ?? {});
    assert.equal(afterUndoClips.length, 1);
    assert.equal(afterUndoClips[0].start, 10);
    assert.equal(afterUndoClips[0].end, 40);

    dispatcher.redo();
    const afterRedoTrack =
        dispatcher.getState().document.sequences.sequences['anim-sequence-split'].tracks[
            'anim-track-split'
        ];
    const afterRedoClips = Object.values(afterRedoTrack.clips ?? {});
    assert.equal(afterRedoClips.length, 2);
    assert.equal(afterRedoClips[0].start, 10);
    assert.equal(afterRedoClips[0].end, 25);
    assert.equal(afterRedoClips[1].start, 25);
    assert.equal(afterRedoClips[1].end, 40);
});
