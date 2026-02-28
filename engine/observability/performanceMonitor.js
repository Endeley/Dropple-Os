import { performance } from 'perf_hooks';
import { evaluateTimeline } from '../timeline/evaluateTimeline.js';
import { countTracks, countGroups, countChannels } from './complexityCounters.js';

function defaultNow() {
    return performance.now();
}

function resolveFrame(frame) {
    if (frame && typeof frame === 'object') return frame;
    return { time: frame };
}

export function evaluateTimelineWithMetrics(timeline, frame) {
    const resolved = resolveFrame(frame);
    const time = Number.isFinite(resolved.time)
        ? resolved.time
        : Number.isFinite(resolved.timeMs)
        ? resolved.timeMs
        : 0;
    const evaluateChannel =
        typeof resolved.evaluateChannel === 'function'
            ? resolved.evaluateChannel
            : typeof resolved.channelEvaluator === 'function'
            ? resolved.channelEvaluator
            : () => 0;
    const blend =
        typeof resolved.blend === 'function'
            ? resolved.blend
            : (a, b) => (a === undefined ? b : b);
    const now = typeof resolved.now === 'function' ? resolved.now : defaultNow;

    const start = now();
    const result = evaluateTimeline(timeline, time, evaluateChannel, blend);
    const end = now();

    return {
        result,
        metrics: {
            evalMs: Math.max(0, end - start),
            trackCount: countTracks(timeline),
            groupCount: countGroups(timeline),
            channelCount: countChannels(timeline),
        },
    };
}
