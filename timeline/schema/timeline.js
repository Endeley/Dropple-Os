export function createTimeline({ fps = 60, duration = 0, unit = 'frames' } = {}) {
    return {
        id: crypto.randomUUID(),
        fps,
        duration,
        unit, // 'frames' | 'ms'
        tracks: [],
    };
}
