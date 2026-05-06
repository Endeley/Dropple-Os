import { resolveActiveClips } from './resolveActiveClips.js';

export function resolveActiveCamera({ sequence, frame = null, timeMs = null } = {}) {
    if (!sequence) return null;

    const activeClips = resolveActiveClips({ sequence, frame, timeMs });
    const preferredIndex = activeClips.findIndex(
        (entry) =>
            entry.trackType === 'camera' ||
            entry.trackType === 'shot' ||
            entry.clip?.cameraNodeRef ||
            entry.clip?.cameraRef
    );
    const preferred = preferredIndex >= 0 ? activeClips[preferredIndex] : null;

    if (!preferred) return null;

    const nodeRef = preferred.clip.cameraNodeRef ?? preferred.clip.cameraRef ?? null;
    const startTime = Number(preferred.start ?? 0);
    const endTime = Number(preferred.end ?? startTime);

    return {
        sequenceId: sequence.id,
        trackId: preferred.trackId,
        clipId: preferred.clipId,
        nodeRef,
        cameraNodeRef: nodeRef,
        sourceType:
            preferred.trackType === 'camera'
                ? 'camera-track'
                : preferred.trackType === 'shot'
                  ? 'shot-track'
                  : preferred.clip?.cameraNodeRef
                    ? 'clip-ref'
                    : 'legacy-camera-ref',
        startTime,
        endTime,
        priority: preferredIndex,
        clip: preferred.clip,
    };
}
