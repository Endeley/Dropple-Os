/**
 * Applies simple motion presets to a track.
 * Pure function: returns new track with preset keyframes.
 */
export function applyMotionPreset({ track, preset, duration }) {
    switch (preset) {
        case 'fade-in':
            return {
                ...track,
                keyframes: [
                    { time: 0, value: 0, easing: 'linear' },
                    { time: duration, value: 1, easing: 'ease-out' },
                ],
            };
        case 'slide-up':
            return {
                ...track,
                keyframes: [
                    { time: 0, value: 40, easing: 'ease-out' },
                    { time: duration, value: 0, easing: 'ease-out' },
                ],
            };
        default:
            return track;
    }
}
