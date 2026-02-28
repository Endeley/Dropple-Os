import {
    countTracks,
    countGroups,
    countChannels,
} from './complexityCounters.js';

export const THRESHOLDS = {
    MAX_TRACKS_VIDEO: 100,
    MAX_CHANNEL_DENSITY: 500,
    MAX_EVAL_P95_MS: 16,
};

export function computeCapabilityIndex(controller) {
    const snapshotGraph = controller?.snapshotGraph ?? null;
    const headId = controller?.headId ?? null;
    const timeline = snapshotGraph?.nodes?.[headId]?.timeline ?? null;

    const trackCount = countTracks(timeline);
    const groupCount = countGroups(timeline);
    const channelCount = countChannels(timeline);
    const channelDensity = trackCount > 0 ? channelCount / trackCount : channelCount;

    const evalP95Ms =
        controller?.performance?.evalP95Ms ??
        controller?.metrics?.evalP95Ms ??
        controller?.observability?.evalP95Ms ??
        null;

    const withinTrackLimit = trackCount <= THRESHOLDS.MAX_TRACKS_VIDEO;
    const withinChannelDensity = channelDensity <= THRESHOLDS.MAX_CHANNEL_DENSITY;
    const withinEvalBudget = evalP95Ms == null
        ? null
        : evalP95Ms <= THRESHOLDS.MAX_EVAL_P95_MS;

    const warnings = [];
    if (!withinTrackLimit) {
        warnings.push('Track count exceeds MAX_TRACKS_VIDEO');
    }
    if (!withinChannelDensity) {
        warnings.push('Channel density exceeds MAX_CHANNEL_DENSITY');
    }
    if (withinEvalBudget === false) {
        warnings.push('Evaluation p95 exceeds MAX_EVAL_P95_MS');
    }
    if (withinEvalBudget === null) {
        warnings.push('Evaluation p95 unavailable');
    }

    const readinessOk =
        withinTrackLimit &&
        withinChannelDensity &&
        (withinEvalBudget === null ? true : withinEvalBudget);

    return {
        complexity: {
            trackCount,
            groupCount,
            channelCount,
            channelDensity,
        },
        performance: {
            evalP95Ms,
            withinBudget: withinEvalBudget,
        },
        readiness: {
            withinTrackLimit,
            withinChannelDensity,
            withinEvalBudget,
            ok: readinessOk,
        },
        warnings,
    };
}
