const MEDIA_MODE_CONFIG = Object.freeze({
    animation: {
        id: 'animation',
        label: 'Animation',
        summary: 'Scene-based motion, keyframes, timing, and visual storytelling.',
        serves: [
            'animators',
            'motion designers',
            'explainer creators',
            'story-focused media teams',
        ],
        tools: ['select', 'transform', 'keyframe', 'path', 'marker'],
        trackTypes: ['transform', 'rig', 'camera', 'fx', 'audio'],
        exportFormats: ['mp4', 'gif', 'lottie'],
    },
    video: {
        id: 'video',
        label: 'Video',
        summary: 'Clip sequencing, overlays, transitions, and timeline-driven assembly.',
        serves: [
            'video creators',
            'editors',
            'social content teams',
            'product marketing teams',
        ],
        tools: ['select', 'cut', 'trim', 'overlay', 'marker'],
        trackTypes: ['clips', 'overlays', 'transitions', 'audio'],
        exportFormats: ['mp4'],
    },
    audio: {
        id: 'audio',
        label: 'Audio',
        summary: 'Audio-first sequencing with cues, markers, chapters, and export flows.',
        serves: [
            'podcasters',
            'voice creators',
            'audio editors',
            'education teams',
            'dialogue-driven storytellers',
        ],
        tools: ['select', 'segment', 'marker', 'cue'],
        trackTypes: ['dialogue', 'music', 'sfx', 'markers'],
        exportFormats: ['mp3', 'wav'],
    },
});

const PODCAST_OVERLAY_MODE_CONFIG = Object.freeze({
    ...MEDIA_MODE_CONFIG.audio,
    overlayId: 'podcast',
    overlayLabel: 'Podcast',
});

export function isPodcastOverlayMode(modeOrModeId, overlayId = null) {
    if (modeOrModeId && typeof modeOrModeId === 'object') {
        return modeOrModeId.overlayId === 'podcast';
    }

    return overlayId === 'podcast';
}

export function getMediaModeConfig(modeId, options = {}) {
    const overlayId = typeof options === 'string' ? options : options?.overlayId ?? null;

    if (modeId === 'audio' && isPodcastOverlayMode(modeId, overlayId)) {
        return PODCAST_OVERLAY_MODE_CONFIG;
    }

    return MEDIA_MODE_CONFIG[modeId] ?? MEDIA_MODE_CONFIG.animation;
}
