function stableCompare(left, right) {
    return String(left ?? '').localeCompare(String(right ?? ''));
}

function normalizeKeyframe(keyframe, index, trackId) {
    const time = Number(keyframe?.time ?? keyframe?.t ?? 0);

    return {
        id: keyframe?.id ?? `${trackId}-keyframe-${index}-${time}`,
        time,
        value: keyframe?.value ?? keyframe?.v ?? 0,
        easing: keyframe?.easing ?? keyframe?.interpolation ?? 'linear',
        interpolation: keyframe?.interpolation ?? keyframe?.easing ?? 'linear',
        handleIn: keyframe?.handleIn ?? null,
        handleOut: keyframe?.handleOut ?? null,
    };
}

const EMPTY_ASSETS = Object.freeze({
    images: Object.freeze({}),
    videos: Object.freeze({}),
    audio: Object.freeze({}),
});

const EMPTY_EXPORTS = Object.freeze({
    targets: Object.freeze([]),
});

const EMPTY_SELECTION = Object.freeze({
    ids: Object.freeze([]),
    primary: null,
    count: 0,
});

const EMPTY_PLAYBACK = Object.freeze({
    isPlaying: false,
});

function selectDefaultTimeline(state) {
    return state?.timeline?.timelines?.default ?? null;
}

export function selectMediaTimeline(state) {
    return selectDefaultTimeline(state);
}

export function projectMediaTimelineTracks(timeline) {
    const tracks = Array.isArray(timeline?.tracks) ? timeline.tracks : [];

    return tracks
        .map((track, index) => {
            const clip = Array.isArray(track?.clips) ? track.clips[0] ?? null : null;
            const trackId = track?.id ?? `track-${index}`;
            const keyframes = Array.isArray(clip?.keyframes)
                ? clip.keyframes
                      .map((keyframe, keyframeIndex) => normalizeKeyframe(keyframe, keyframeIndex, trackId))
                      .sort((left, right) => {
                          const timeDelta = Number(left?.time ?? 0) - Number(right?.time ?? 0);
                          if (timeDelta !== 0) return timeDelta;
                          return stableCompare(left?.id, right?.id);
                      })
                : [];

            return {
                id: trackId,
                nodeId: track?.nodeId ?? clip?.nodeId ?? clip?.target ?? null,
                property: track?.property ?? clip?.property ?? null,
                clipId: clip?.id ?? null,
                keyframes,
            };
        })
        .sort((left, right) => stableCompare(left.id, right.id));
}

function inferAnimationGroup(property) {
    const value = String(property ?? '').toLowerCase();
    if (value.includes('position') || value.includes('layout') || value.includes('transform')) {
        return 'Motion';
    }
    if (value.includes('rotation') || value.includes('scale')) {
        return 'Transform';
    }
    if (value.includes('opacity') || value.includes('color') || value.includes('fill') || value.includes('stroke')) {
        return 'Style';
    }
    if (value.includes('camera')) {
        return 'Camera';
    }
    if (value.includes('audio') || value.includes('volume')) {
        return 'Audio';
    }
    return 'Channels';
}

export function projectAnimationTrackGroups(tracks) {
    const grouped = new Map();

    for (const track of tracks ?? []) {
        const group = inferAnimationGroup(track?.property);
        const existing = grouped.get(group) ?? [];
        existing.push(track);
        grouped.set(group, existing);
    }

    return Array.from(grouped.entries())
        .map(([label, items]) => ({
            label,
            tracks: items.sort((left, right) => {
                const propertyDelta = stableCompare(left.property, right.property);
                if (propertyDelta !== 0) return propertyDelta;
                return stableCompare(left.id, right.id);
            }),
        }))
        .sort((left, right) => stableCompare(left.label, right.label));
}

export function projectAnimationTrackSummary(track) {
    const keyframes = Array.isArray(track?.keyframes) ? track.keyframes : [];
    const firstTime = keyframes.length ? Number(keyframes[0]?.time ?? 0) : null;
    const lastTime = keyframes.length ? Number(keyframes[keyframes.length - 1]?.time ?? 0) : null;

    return {
        label: track?.property ?? track?.id ?? 'track',
        nodeId: track?.nodeId ?? null,
        keyframeCount: keyframes.length,
        firstTime,
        lastTime,
        span:
            firstTime == null || lastTime == null
                ? 0
                : Math.max(0, lastTime - firstTime),
    };
}

export function projectMediaActiveKeyframe(track, keyframeId) {
    if (!track || !keyframeId) return null;
    return (track.keyframes || []).find((keyframe) => keyframe?.id === keyframeId) ?? null;
}

export function projectMediaSelectedKeyframes(track, keyframeIds) {
    if (!track || !Array.isArray(keyframeIds) || !keyframeIds.length) return [];

    const selectedIds = new Set(keyframeIds);
    return (track.keyframes || []).filter((keyframe) => selectedIds.has(keyframe?.id));
}

export function projectMediaTweenSpan(track, keyframeId) {
    const keyframes = Array.isArray(track?.keyframes) ? track.keyframes : [];
    if (!keyframes.length || !keyframeId) return null;

    const index = keyframes.findIndex((keyframe) => keyframe?.id === keyframeId);
    if (index === -1) return null;

    const current = keyframes[index];
    const previous = index > 0 ? keyframes[index - 1] : null;
    const next = index < keyframes.length - 1 ? keyframes[index + 1] : null;

    if (!current || !next) {
        return {
            previous,
            current,
            next,
            duration: 0,
        };
    }

    return {
        previous,
        current,
        next,
        duration: Math.max(0, Number(next.time ?? 0) - Number(current.time ?? 0)),
    };
}

export function projectMediaSelectionSpan(track, keyframeIds) {
    const selectedKeyframes = projectMediaSelectedKeyframes(track, keyframeIds);
    if (!selectedKeyframes.length) return null;

    const first = selectedKeyframes[0];
    const last = selectedKeyframes[selectedKeyframes.length - 1];

    return {
        keyframes: selectedKeyframes,
        first,
        last,
        count: selectedKeyframes.length,
        duration: Math.max(0, Number(last?.time ?? 0) - Number(first?.time ?? 0)),
    };
}

export function selectMediaPlayback(state) {
    return state?.playback ?? EMPTY_PLAYBACK;
}

export function selectMediaCursorIndex(state) {
    return Number(state?.cursorIndex ?? -1);
}

export function projectMediaPlaybackState({ playback, cursorIndex, timeline }) {
    return {
        playing: playback?.isPlaying === true,
        time: Number(cursorIndex ?? -1),
        duration: Number(timeline?.duration ?? 0),
        unit: timeline?.unit ?? 'frames',
        fps: Number(timeline?.fps ?? 60),
    };
}

export function selectMediaAssets(state) {
    return state?.document?.assets ?? EMPTY_ASSETS;
}

export function projectMediaAssetSummary(asset, id = null, type = null) {
    if (!asset || typeof asset !== 'object') return null;

    const durationMs = Number(asset.durationMs ?? 0);
    const trimStartMs = Number(asset.trimStartMs ?? 0);
    const trimEndMs = Number(asset.trimEndMs ?? durationMs);
    const proxy = asset.proxy && typeof asset.proxy === 'object' ? { ...asset.proxy } : null;
    const waveform = asset.waveform && typeof asset.waveform === 'object'
        ? {
              peaks: Array.isArray(asset.waveform.peaks) ? [...asset.waveform.peaks] : [],
              bucketMs: Number.isFinite(asset.waveform.bucketMs) ? Number(asset.waveform.bucketMs) : null,
              sampleCount: Number.isFinite(asset.waveform.sampleCount)
                  ? Number(asset.waveform.sampleCount)
                  : Array.isArray(asset.waveform.peaks)
                    ? asset.waveform.peaks.length
                    : 0,
              durationMs: Number.isFinite(asset.waveform.durationMs) ? Number(asset.waveform.durationMs) : null,
          }
        : null;

    return {
        id: asset.id ?? id,
        type: asset.type ?? type ?? null,
        url: asset.url ?? '',
        durationMs,
        trimStartMs,
        trimEndMs,
        effectiveDurationMs: Math.max(0, trimEndMs - trimStartMs),
        mimeType: asset.mimeType ?? null,
        width: Number.isFinite(asset.width) ? Number(asset.width) : null,
        height: Number.isFinite(asset.height) ? Number(asset.height) : null,
        channels: Number.isFinite(asset.channels) ? Number(asset.channels) : null,
        sampleRate: Number.isFinite(asset.sampleRate) ? Number(asset.sampleRate) : null,
        frameRate: Number.isFinite(asset.frameRate) ? Number(asset.frameRate) : null,
        proxyId: asset.proxyId ?? proxy?.id ?? null,
        proxy,
        hasProxy: Boolean(asset.proxyId ?? proxy?.id ?? proxy?.url),
        waveform,
        hasWaveform: Boolean(waveform && waveform.sampleCount > 0),
        meta: asset.meta && typeof asset.meta === 'object' ? { ...asset.meta } : {},
    };
}

export function projectMediaAssets(assets) {
    const groups = [
        ['image', assets.images],
        ['video', assets.videos],
        ['audio', assets.audio],
    ];

    return groups
        .flatMap(([type, entries]) =>
            Object.entries(entries ?? {}).map(([id, asset]) => ({
                ...projectMediaAssetSummary(asset, id, type),
            }))
        )
        .sort((left, right) => {
            const typeDelta = stableCompare(left.type, right.type);
            if (typeDelta !== 0) return typeDelta;
            return stableCompare(left.id, right.id);
        });
}

export function selectMediaExports(state) {
    return state?.document?.exports ?? EMPTY_EXPORTS;
}

export function projectMediaExportTargets(exportsState) {
    const targets = Array.isArray(exportsState?.targets) ? exportsState.targets : [];

    return targets
        .map((target) => ({
            id: target?.id ?? null,
            type: target?.type ?? target?.format ?? null,
            format: target?.format ?? target?.type ?? null,
            presetId: target?.presetId ?? null,
            label: target?.label ?? null,
            delivery: target?.delivery ?? 'master',
            width: Number.isFinite(target?.width) ? Number(target.width) : null,
            height: Number.isFinite(target?.height) ? Number(target.height) : null,
            frameRate: Number.isFinite(target?.frameRate) ? Number(target.frameRate) : null,
            bitRateKbps: Number.isFinite(target?.bitRateKbps) ? Number(target.bitRateKbps) : null,
            sampleRate: Number.isFinite(target?.sampleRate) ? Number(target.sampleRate) : null,
            channels: Number.isFinite(target?.channels) ? Number(target.channels) : null,
            includeVideo: target?.includeVideo !== false,
            includeAudio: target?.includeAudio !== false,
            includeAlpha: target?.includeAlpha === true,
            hasProxy: Boolean(target?.proxy?.id ?? target?.proxy?.url),
        }))
        .sort((left, right) => stableCompare(left.id, right.id));
}

export function selectMediaSelection(state) {
    return state?.selection ?? EMPTY_SELECTION;
}

export function projectMediaSelection(selection) {
    const ids = Array.isArray(selection?.ids) ? selection.ids : [];
    return {
        nodeIds: [...ids].sort(stableCompare),
        primary: selection?.primary ?? null,
        count: Number(selection?.count ?? ids.length),
    };
}
