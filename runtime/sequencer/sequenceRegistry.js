import { normalizeSequenceClip, normalizeSequenceTrack } from '@/core/sequencer/sequenceClipContract.js';

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
    allowOverlap = false,
    clips = EMPTY_COLLECTION,
} = {}) {
    if (!id) return null;

    return normalizeSequenceTrack({
        id,
        type,
        label,
        order,
        allowOverlap,
        clips: { ...clips },
    });
}

export function createSequenceClip({
    id,
    label = '',
    start = 0,
    end = 0,
    assetId = null,
    assetType = null,
    mediaType = null,
    trimStartMs = 0,
    trimEndMs = 0,
    playbackRate = 1,
    gainDb = 0,
    muted = false,
    opacity = 1,
    fadeInMs = 0,
    fadeOutMs = 0,
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

    return normalizeSequenceClip({
        id,
        label,
        start,
        end,
        assetId,
        assetType,
        mediaType,
        trimStartMs,
        trimEndMs,
        playbackRate,
        gainDb,
        muted,
        opacity,
        fadeInMs,
        fadeOutMs,
        cameraNodeRef,
        cameraRef,
        animationRef,
        audioAsset,
        effectRef,
        sceneRef,
        sequenceRef,
        meta: meta && typeof meta === 'object' ? { ...meta } : {},
    });
}
