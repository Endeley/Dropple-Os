import { hashTimeline } from '../../domain/timeline/TimelineContract.js';
import {
    createTimelineHistory,
    applyTimelineMutation,
    checkoutSnapshot,
} from '../timeline/timelineHistory.js';
import { evaluateChannelTimeline } from '../timeline/evaluateTimeline.js';
import { runExportStabilityGate } from '../export/exportStabilityGate.js';
import {
    countTracks,
    countGroups,
    countChannels,
    countDagNodes,
    countDagBranches,
} from './complexityCounters.js';
import { evaluateTimelineWithMetrics } from './performanceMonitor.js';
import { computeCapabilityIndex } from './capabilityIndex.js';
import { createTimelineController } from '../timeline/timelineController.js';

const timeline = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x', 'y'] },
        { id: 't2', type: 'standard', order: 1, channelIds: ['z'] },
        { id: 't3', type: 'mute', order: 2, channelIds: ['w'] },
    ],
    groups: [{ id: 'g1', order: 0, trackIds: ['t1', 't2'] }],
    channels: [],
};

const baseHash = hashTimeline(timeline);
const countsA = {
    trackCount: countTracks(timeline),
    groupCount: countGroups(timeline),
    channelCount: countChannels(timeline),
};
const countsB = {
    trackCount: countTracks(timeline),
    groupCount: countGroups(timeline),
    channelCount: countChannels(timeline),
};

console.log('COUNTS DETERMINISTIC:', JSON.stringify(countsA) === JSON.stringify(countsB));
console.log('COUNTERS HASH SAFE:', baseHash === hashTimeline(timeline));

let graph = createTimelineHistory(timeline);
const next1 = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x', 'y'] },
        { id: 't2', type: 'standard', order: 1, channelIds: ['z'] },
        { id: 't3', type: 'standard', order: 2, channelIds: ['q'] },
    ],
    groups: [],
    channels: [],
};
const next2 = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x', 'y'] },
        { id: 't2', type: 'standard', order: 1, channelIds: ['z'] },
        { id: 't3', type: 'standard', order: 2, channelIds: ['q'] },
        { id: 't4', type: 'standard', order: 3, channelIds: ['r'] },
    ],
    groups: [],
    channels: [],
};

graph = applyTimelineMutation(graph, next1);
graph = applyTimelineMutation(graph, next2);

graph = checkoutSnapshot(graph, graph.nodes[graph.headId].parentIds[0]);
const branch = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x', 'y'] },
        { id: 't5', type: 'standard', order: 1, channelIds: ['s'] },
    ],
    groups: [],
    channels: [],
};

graph = applyTimelineMutation(graph, branch);

const dagCounts = {
    nodeCount: countDagNodes(graph),
    branchCount: countDagBranches(graph),
};
const dagCountsAgain = {
    nodeCount: countDagNodes(graph),
    branchCount: countDagBranches(graph),
};
console.log('DAG COUNTS DETERMINISTIC:', JSON.stringify(dagCounts) === JSON.stringify(dagCountsAgain));

function evaluateChannel(id, time) {
    if (id === 'x') return time;
    if (id === 'y') return time + 1;
    return 0;
}

function blend(a, b) {
    return a + b;
}

const baselineEval = evaluateChannelTimeline(timeline, 5, evaluateChannel, blend);
const withMetrics = evaluateTimelineWithMetrics(timeline, {
    time: 5,
    evaluateChannel,
    blend,
    now: (() => {
        let t = 100;
        return () => {
            const current = t;
            t += 4;
            return current;
        };
    })(),
});
console.log('EVAL UNCHANGED:', JSON.stringify(baselineEval) === JSON.stringify(withMetrics.result));

const withMetricsAgain = evaluateTimelineWithMetrics(timeline, {
    time: 5,
    evaluateChannel,
    blend,
    now: (() => {
        let t = 100;
        return () => {
            const current = t;
            t += 4;
            return current;
        };
    })(),
});
console.log(
    'METRICS DETERMINISTIC:',
    JSON.stringify(withMetrics.metrics) === JSON.stringify(withMetricsAgain.metrics)
);

const shotTimeline = { shots: [{ id: 's1', startMs: 0, endMs: 1000 }] };
const sceneGraph = { id: 'root', type: 'frame', children: [] };
const gateA = runExportStabilityGate({
    timeline,
    shotTimeline,
    sceneGraph,
});

computeCapabilityIndex(createTimelineController(timeline));
countTracks(timeline);
countGroups(timeline);
countChannels(timeline);

const gateB = runExportStabilityGate({
    timeline,
    shotTimeline,
    sceneGraph,
});

console.log(
    'EXPORT GATE UNAFFECTED:',
    gateA.allowed === gateB.allowed &&
        gateA.timelineHash === gateB.timelineHash &&
        gateA.evaluationHash === gateB.evaluationHash
);

console.log('OBSERVABILITY HASH SAFE:', baseHash === hashTimeline(timeline));
