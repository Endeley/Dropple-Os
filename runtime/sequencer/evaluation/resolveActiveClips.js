function toOrderedTracks(sequence) {
    return Object.values(sequence?.tracks || {}).sort((a, b) => {
        const orderDelta = (a?.order ?? 0) - (b?.order ?? 0);
        if (orderDelta !== 0) return orderDelta;
        return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
    });
}

function normalizeFrame(sequence, { frame = null, timeMs = null } = {}) {
    if (Number.isFinite(frame)) return frame;
    const frameRate = Number.isFinite(sequence?.frameRate) && sequence.frameRate > 0 ? sequence.frameRate : 24;
    if (Number.isFinite(timeMs)) {
        return (timeMs / 1000) * frameRate;
    }
    return 0;
}

export function resolveActiveClips({ sequence, frame = null, timeMs = null } = {}) {
    if (!sequence) return [];

    const currentFrame = normalizeFrame(sequence, { frame, timeMs });
    const tracks = toOrderedTracks(sequence);
    const active = [];

    for (const track of tracks) {
        const clips = Object.values(track?.clips || {}).sort((a, b) => {
            const startDelta = (a?.start ?? 0) - (b?.start ?? 0);
            if (startDelta !== 0) return startDelta;
            return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
        });

        for (const clip of clips) {
            const start = Number.isFinite(clip?.start) ? clip.start : 0;
            const end = Number.isFinite(clip?.end) ? clip.end : start;
            const isLastFrame = currentFrame === end && end === sequence?.duration;
            if ((currentFrame >= start && currentFrame < end) || isLastFrame) {
                active.push({
                    trackId: track.id,
                    trackType: track.type ?? 'generic',
                    trackLabel: track.label ?? track.id,
                    clipId: clip.id,
                    clip,
                    start,
                    end,
                });
            }
        }
    }

    return active;
}
