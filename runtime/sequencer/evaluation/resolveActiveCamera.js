import { resolveActiveClips } from './resolveActiveClips.js';

export function resolveActiveCamera({ sequence, frame = null, timeMs = null } = {}) {
    if (!sequence) return null;

    const activeClips = resolveActiveClips({ sequence, frame, timeMs });
    const preferred = activeClips.find(
        (entry) =>
            entry.trackType === 'camera' ||
            entry.trackType === 'shot' ||
            entry.clip?.cameraNodeRef ||
            entry.clip?.cameraRef
    );

    if (!preferred) return null;

    return {
        sequenceId: sequence.id,
        trackId: preferred.trackId,
        clipId: preferred.clipId,
        cameraNodeRef: preferred.clip.cameraNodeRef ?? preferred.clip.cameraRef ?? null,
        clip: preferred.clip,
    };
}
