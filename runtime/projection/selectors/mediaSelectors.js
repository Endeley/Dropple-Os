function stableCompare(left, right) {
    return String(left ?? '').localeCompare(String(right ?? ''));
}

const EMPTY_ASSETS = Object.freeze({
    images: Object.freeze({}),
    videos: Object.freeze({}),
    audio: Object.freeze({}),
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
            const keyframes = Array.isArray(clip?.keyframes)
                ? [...clip.keyframes].sort((left, right) => {
                      const timeDelta = Number(left?.time ?? 0) - Number(right?.time ?? 0);
                      if (timeDelta !== 0) return timeDelta;
                      return stableCompare(left?.id, right?.id);
                  })
                : [];

            return {
                id: track?.id ?? `track-${index}`,
                nodeId: track?.nodeId ?? clip?.nodeId ?? null,
                property: track?.property ?? clip?.property ?? null,
                clipId: clip?.id ?? null,
                keyframes,
            };
        })
        .sort((left, right) => stableCompare(left.id, right.id));
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

export function projectMediaAssets(assets) {
    const groups = [
        ['image', assets.images],
        ['video', assets.videos],
        ['audio', assets.audio],
    ];

    return groups
        .flatMap(([type, entries]) =>
            Object.entries(entries ?? {}).map(([id, asset]) => ({
                id,
                type,
                ...asset,
            }))
        )
        .sort((left, right) => {
            const typeDelta = stableCompare(left.type, right.type);
            if (typeDelta !== 0) return typeDelta;
            return stableCompare(left.id, right.id);
        });
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
