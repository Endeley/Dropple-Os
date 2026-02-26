import { normalizeTimeline } from '../../domain/timeline/TimelineContract.js';

export function evaluateTimeline(timeline, time, evaluateChannel, blend) {
    const normalized = normalizeTimeline(timeline);

    const output = Object.create(null);

    for (const track of normalized.tracks) {
        if (track.type === 'mute') continue;

        for (const channelId of track.channelIds) {
            const value = evaluateChannel(channelId, time);

            if (track.type === 'overlay') {
                output[channelId] = value;
            } else if (
                track.type === 'standard' &&
                track.meta?.blendMode &&
                track.meta.blendMode !== 'add' &&
                track.meta.blendMode !== 'replace'
            ) {
                throw new Error('Invalid blend mode at evaluation boundary');
            } else if (track.type === 'standard' && track.meta?.blendMode === 'replace') {
                output[channelId] = value;
            } else {
                const prev = output[channelId];
                output[channelId] = prev === undefined ? value : blend(prev, value);
            }
        }
    }

    return output;
}
