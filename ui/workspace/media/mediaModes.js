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
    podcast: {
        id: 'podcast',
        label: 'Podcast',
        summary: 'Audio-first sequencing with cues, markers, and export flows.',
        serves: [
            'podcasters',
            'voice creators',
            'education teams',
            'dialogue-driven storytellers',
        ],
        tools: ['select', 'segment', 'marker', 'cue'],
        trackTypes: ['dialogue', 'music', 'sfx', 'markers'],
        exportFormats: ['mp3', 'wav'],
    },
});

export function getMediaModeConfig(modeId) {
    return MEDIA_MODE_CONFIG[modeId] ?? MEDIA_MODE_CONFIG.animation;
}
