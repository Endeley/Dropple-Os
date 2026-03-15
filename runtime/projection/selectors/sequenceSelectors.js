import { evaluateSequence } from '@/runtime/sequencer/evaluation/evaluateSequence.js';

export function selectSequenceState(document) {
    return document?.sequences ?? { sequences: {}, activeSequenceId: null };
}

export function selectSequenceMap(document) {
    return selectSequenceState(document).sequences ?? {};
}

export function selectActiveSequenceId(document) {
    return selectSequenceState(document).activeSequenceId ?? null;
}

export function selectActiveSequence(document) {
    const sequenceId = selectActiveSequenceId(document);
    return sequenceId ? selectSequenceMap(document)[sequenceId] ?? null : null;
}

export function projectSequences(document) {
    return Object.values(selectSequenceMap(document));
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

export function projectActiveSequenceView(document, playback = {}) {
    const sequence = selectActiveSequence(document);
    return evaluateSequence({
        sequence,
        frame: playback?.frame ?? null,
        timeMs: playback?.timeMs ?? null,
    });
}
