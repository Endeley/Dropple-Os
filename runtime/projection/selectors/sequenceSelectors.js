import { evaluateSequence } from '../../sequencer/evaluation/evaluateSequence.js';

function getDocument(stateOrDocument) {
    return stateOrDocument?.document ?? stateOrDocument ?? {};
}

function getRuntimeScene(stateOrDocument) {
    return stateOrDocument?.scene ?? null;
}

function getRuntimePlayback(stateOrDocument) {
    return stateOrDocument?.playback ?? null;
}

export function selectSequenceState(stateOrDocument) {
    const document = getDocument(stateOrDocument);
    return document?.sequences ?? { sequences: {}, activeSequenceId: null };
}

export function selectSequenceMap(stateOrDocument) {
    return selectSequenceState(stateOrDocument).sequences ?? {};
}

export function selectActiveSequenceId(stateOrDocument) {
    const runtimeSequenceId = getRuntimeScene(stateOrDocument)?.temporalContext?.sequenceId ?? null;
    if (runtimeSequenceId) return runtimeSequenceId;
    return selectSequenceState(stateOrDocument).activeSequenceId ?? null;
}

export function selectActiveSequence(stateOrDocument) {
    const sequenceId = selectActiveSequenceId(stateOrDocument);
    return sequenceId ? selectSequenceMap(stateOrDocument)[sequenceId] ?? null : null;
}

export function projectSequences(stateOrDocument) {
    return Object.values(selectSequenceMap(stateOrDocument));
}

export function projectSequenceTracks(sequence) {
    return Object.values(sequence?.tracks || {}).sort((a, b) => {
        const orderDelta = (a?.order ?? 0) - (b?.order ?? 0);
        if (orderDelta !== 0) return orderDelta;
        return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
    });
}

export function projectSequenceTimelineTracks(sequence) {
    return projectSequenceTracks(sequence).map((track) => {
        const clips = Object.values(track?.clips || {}).sort((a, b) => {
            const startDelta = Number(a?.start ?? 0) - Number(b?.start ?? 0);
            if (startDelta !== 0) return startDelta;
            return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
        });

        return {
            id: `sequence:${sequence?.id ?? 'unknown'}:${track.id}`,
            sequenceId: sequence?.id ?? null,
            label: track?.label ?? track?.id ?? 'Track',
            property: track?.label ?? track?.type ?? track?.id ?? 'Track',
            kind: 'sequence-track',
            trackType: track?.type ?? 'generic',
            clips,
            keyframes: clips.map((clip, index) => ({
                id: `${track?.id ?? 'track'}:clip:${clip?.id ?? index}`,
                time: Number(clip?.start ?? 0),
                value: clip?.label ?? clip?.id ?? index,
                easing: 'hold',
                interpolation: 'hold',
                clipId: clip?.id ?? null,
            })),
        };
    });
}

export function projectActiveSequenceView(stateOrDocument, playback = {}) {
    const runtimePlayback = getRuntimePlayback(stateOrDocument);
    const sequence = selectActiveSequence(stateOrDocument);
    return evaluateSequence({
        sequence,
        frame: playback?.frame ?? runtimePlayback?.frame ?? runtimePlayback?.time ?? null,
        timeMs: playback?.timeMs ?? runtimePlayback?.timeMs ?? null,
    });
}
