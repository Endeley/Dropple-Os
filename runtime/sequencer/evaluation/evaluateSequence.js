import { resolveActiveClips } from './resolveActiveClips.js';
import { resolveActiveCamera } from './resolveActiveCamera.js';

function normalizeFrameRate(sequence) {
    return Number.isFinite(sequence?.frameRate) && sequence.frameRate > 0 ? sequence.frameRate : 24;
}

function normalizeFrame(sequence, { frame = null, timeMs = null } = {}) {
    if (Number.isFinite(frame)) return frame;
    const frameRate = normalizeFrameRate(sequence);
    if (Number.isFinite(timeMs)) return (timeMs / 1000) * frameRate;
    return 0;
}

export function evaluateSequence({ sequence, frame = null, timeMs = null } = {}) {
    if (!sequence) {
        return {
            sequenceId: null,
            frameRate: 24,
            frame: 0,
            timeMs: 0,
            activeClips: [],
            activeCamera: null,
        };
    }

    const frameRate = normalizeFrameRate(sequence);
    const resolvedFrame = normalizeFrame(sequence, { frame, timeMs });
    const resolvedTimeMs =
        Number.isFinite(timeMs) ? timeMs : Math.round((resolvedFrame / frameRate) * 1000);

    return {
        sequenceId: sequence.id,
        frameRate,
        frame: resolvedFrame,
        timeMs: resolvedTimeMs,
        activeClips: resolveActiveClips({ sequence, frame: resolvedFrame }),
        activeCamera: resolveActiveCamera({ sequence, frame: resolvedFrame }),
    };
}
