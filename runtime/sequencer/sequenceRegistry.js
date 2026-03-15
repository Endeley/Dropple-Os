const EMPTY_COLLECTION = Object.freeze({});

export function createSequence({
    id,
    label = '',
    duration = 0,
    frameRate = 24,
    tracks = EMPTY_COLLECTION,
    markers = [],
} = {}) {
    if (!id) return null;

    return {
        id,
        label,
        duration,
        frameRate,
        tracks: { ...tracks },
        markers: Array.isArray(markers) ? [...markers] : [],
    };
}

export function createSequenceTrack({
    id,
    type = 'generic',
    label = '',
    order = 0,
    clips = EMPTY_COLLECTION,
} = {}) {
    if (!id) return null;

    return {
        id,
        type,
        label,
        order,
        clips: { ...clips },
    };
}

export function createSequenceClip({
    id,
    label = '',
    start = 0,
    end = 0,
    cameraNodeRef = null,
    cameraRef = null,
    animationRef = null,
    audioAsset = null,
    effectRef = null,
    sceneRef = null,
    sequenceRef = null,
    meta = null,
} = {}) {
    if (!id) return null;

    return {
        id,
        label,
        start,
        end,
        cameraNodeRef,
        cameraRef,
        animationRef,
        audioAsset,
        effectRef,
        sceneRef,
        sequenceRef,
        meta: meta && typeof meta === 'object' ? { ...meta } : {},
    };
}
