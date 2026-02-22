export function createTimeline({ fps = 60, duration = 0, unit = 'frames' } = {}) {
    return {
        id: 'default',
        fps,
        duration,
        unit, // 'frames' | 'ms'
        tracks: [],
        events: [],
    };
}
