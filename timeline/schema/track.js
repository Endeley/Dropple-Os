export function createTrack({ type, targetId = null, locked = false, muted = false } = {}) {
    if (!type) throw new Error('Track type required');

    return {
        id: crypto.randomUUID(),
        type, // 'motion' | 'video' | 'audio' | 'events' | 'ai'
        targetId, // nodeId, mediaId, agentId
        locked,
        muted,
        clips: [],
    };
}
