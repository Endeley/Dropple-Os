import { resolveActiveClips } from './resolveActiveClips.js';
import { resolveActiveCamera } from './resolveActiveCamera.js';

function resolveClipAsset(assets, clip) {
    const assetId = clip?.assetId ?? clip?.audioAsset ?? null;
    const assetType = clip?.assetType ?? null;
    if (!assets || !assetId) return null;

    const buckets = assetType
        ? [[assetType, assetType === 'image' ? assets.images : assetType === 'video' ? assets.videos : assets.audio]]
        : [
              ['image', assets.images],
              ['video', assets.videos],
              ['audio', assets.audio],
          ];

    for (const [type, bucket] of buckets) {
        const asset = bucket?.[assetId] ?? null;
        if (asset) {
            return {
                type,
                ...asset,
            };
        }
    }

    return null;
}

function normalizeFrameRate(sequence) {
    return Number.isFinite(sequence?.frameRate) && sequence.frameRate > 0 ? sequence.frameRate : 24;
}

function normalizeFrame(sequence, { frame = null, timeMs = null } = {}) {
    if (Number.isFinite(frame)) return frame;
    const frameRate = normalizeFrameRate(sequence);
    if (Number.isFinite(timeMs)) return (timeMs / 1000) * frameRate;
    return 0;
}

export function evaluateSequence({ sequence, assets = null, frame = null, timeMs = null } = {}) {
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

    const activeClips = resolveActiveClips({ sequence, frame: resolvedFrame }).map((entry) => ({
        ...entry,
        asset: resolveClipAsset(assets, entry.clip),
    }));

    return {
        sequenceId: sequence.id,
        frameRate,
        frame: resolvedFrame,
        timeMs: resolvedTimeMs,
        activeClips,
        activeAudioClips: activeClips.filter(
            (entry) => entry.trackType === 'audio' || entry.clip?.assetType === 'audio' || entry.asset?.type === 'audio',
        ),
        activeVideoClips: activeClips.filter(
            (entry) => entry.trackType === 'video' || entry.clip?.assetType === 'video' || entry.asset?.type === 'video',
        ),
        activeCamera: resolveActiveCamera({ sequence, frame: resolvedFrame }),
    };
}
