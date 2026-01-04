export function createClip({ start = 0, end = 0, source = null, loop = false } = {}) {
    if (end < start) {
        throw new Error('Clip end must be >= start');
    }

    return {
        id: crypto.randomUUID(),
        start,
        end,
        source, // nodeId, media asset, generator
        loop,
        keyframes: [],
    };
}
