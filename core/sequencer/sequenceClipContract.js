function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function coerceBoolean(value, fallback = false) {
    return typeof value === 'boolean' ? value : fallback;
}

export function normalizeSequenceTrack(track = {}) {
    if (!track?.id) return null;

    return {
        id: track.id,
        type: track.type ?? 'generic',
        label: track.label ?? '',
        order: safeNumber(track.order, 0),
        allowOverlap: coerceBoolean(track.allowOverlap, false),
        clips: { ...(track.clips || {}) },
    };
}

export function normalizeSequenceClip(clip = {}) {
    if (!clip?.id) return null;

    const start = safeNumber(clip.start, 0);
    const end = Math.max(start, safeNumber(clip.end, start));
    const assetId = typeof clip.assetId === 'string' && clip.assetId.length ? clip.assetId : null;
    const assetType = typeof clip.assetType === 'string' && clip.assetType.length ? clip.assetType : null;
    const mediaType =
        typeof clip.mediaType === 'string' && clip.mediaType.length
            ? clip.mediaType
            : assetType ?? (assetId ? 'asset' : 'synthetic');

    return {
        id: clip.id,
        label: clip.label ?? '',
        start,
        end,
        assetId,
        assetType,
        mediaType,
        cameraNodeRef: clip.cameraNodeRef ?? null,
        cameraRef: clip.cameraRef ?? null,
        animationRef: clip.animationRef ?? null,
        audioAsset: clip.audioAsset ?? assetId ?? null,
        effectRef: clip.effectRef ?? null,
        sceneRef: clip.sceneRef ?? null,
        sequenceRef: clip.sequenceRef ?? null,
        trimStartMs: Math.max(0, safeNumber(clip.trimStartMs, 0)),
        trimEndMs: Math.max(0, safeNumber(clip.trimEndMs, Math.max(0, end - start))),
        playbackRate: safeNumber(clip.playbackRate, 1) || 1,
        gainDb: safeNumber(clip.gainDb, 0),
        muted: coerceBoolean(clip.muted, false),
        opacity: safeNumber(clip.opacity, 1),
        fadeInMs: Math.max(0, safeNumber(clip.fadeInMs, 0)),
        fadeOutMs: Math.max(0, safeNumber(clip.fadeOutMs, 0)),
        meta: clip.meta && typeof clip.meta === 'object' ? { ...clip.meta } : {},
    };
}

export function sortSequenceClips(clips = []) {
    return [...clips].sort((left, right) => {
        const startDelta = safeNumber(left?.start, 0) - safeNumber(right?.start, 0);
        if (startDelta !== 0) return startDelta;
        return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
    });
}

export function assertCanonicalSequenceClips(clips = [], track = null) {
    const ordered = sortSequenceClips(clips);
    const allowOverlap = coerceBoolean(track?.allowOverlap, false);

    if (allowOverlap) return ordered;

    let previousEnd = -Infinity;
    for (const clip of ordered) {
        if (!clip) continue;
        const start = safeNumber(clip.start, 0);
        const end = Math.max(start, safeNumber(clip.end, start));
        if (start < previousEnd) {
            throw new Error(`sequence: clips must not overlap (${track?.id ?? 'track'}:${clip.id ?? 'unknown'})`);
        }
        previousEnd = end;
    }

    return ordered;
}

export function upsertCanonicalSequenceClip(track, clip, { clipId = null, patch = null } = {}) {
    const normalizedTrack = normalizeSequenceTrack(track);
    if (!normalizedTrack) return null;

    const existingClips = Object.values(normalizedTrack.clips || {});
    const nextClips = existingClips.map((entry) =>
        clipId && entry?.id === clipId ? normalizeSequenceClip({ ...entry, ...(patch || {}) }) : entry
    );

    if (clip) {
        nextClips.push(normalizeSequenceClip(clip));
    }

    const ordered = assertCanonicalSequenceClips(nextClips, normalizedTrack);
    return {
        ...normalizedTrack,
        clips: Object.fromEntries(ordered.map((entry) => [entry.id, entry])),
    };
}
