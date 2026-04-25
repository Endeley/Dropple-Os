function getSequenceMap(state) {
    return state?.document?.sequences?.sequences ?? {};
}

export function selectActiveSequenceView(state) {
    const temporalContext = state?.scene?.temporalContext ?? null;
    if (!temporalContext) return null;

    const sequenceId = temporalContext.sequenceId ?? null;
    const sequence = sequenceId ? getSequenceMap(state)[sequenceId] ?? null : null;

    return {
        sequenceId,
        frameRate:
            Number.isFinite(sequence?.frameRate) && sequence.frameRate > 0
                ? sequence.frameRate
                : 24,
        frame: Number(temporalContext.frame ?? 0),
        timeMs: Number(temporalContext.timeMs ?? 0),
        activeClips: Array.isArray(temporalContext.activeClips) ? temporalContext.activeClips : [],
        activeAudioClips: Array.isArray(temporalContext.activeAudioClips) ? temporalContext.activeAudioClips : [],
        activeVideoClips: Array.isArray(temporalContext.activeVideoClips) ? temporalContext.activeVideoClips : [],
        activeCamera: temporalContext.activeCamera ?? null,
        activeShot: temporalContext.activeShot ?? null,
    };
}
