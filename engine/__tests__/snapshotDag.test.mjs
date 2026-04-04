import { hashTimeline } from '../../domain/timeline/TimelineContract.js';
import {
    createTimelineHistory,
    applyTimelineMutation,
    checkoutSnapshot,
} from '../../engine/timeline/timelineHistory.js';
import { evaluateChannelTimeline } from '../../engine/timeline/evaluateTimeline.js';
import { runExportStabilityGate } from '../../engine/export/exportStabilityGate.js';

const base = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x'] },
    ],
    groups: [],
    channels: [],
};

let graph = createTimelineHistory(base);

const next1 = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x'] },
        { id: 't2', type: 'standard', order: 1, channelIds: ['y'] },
    ],
    groups: [],
    channels: [],
};

graph = applyTimelineMutation(graph, next1);

const next2 = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x'] },
        { id: 't2', type: 'standard', order: 1, channelIds: ['y'] },
        { id: 't3', type: 'standard', order: 2, channelIds: ['z'] },
    ],
    groups: [],
    channels: [],
};

graph = applyTimelineMutation(graph, next2);

const nodeCount = Object.keys(graph.nodes).length;
const headNode = graph.nodes[graph.headId];
const parentId = headNode.parentIds[0];
const parentNode = graph.nodes[parentId];

console.log('LINEAR CHAIN:', nodeCount === 3 && parentNode.childrenIds.includes(graph.headId));

const baseId = hashTimeline(base);
graph = checkoutSnapshot(graph, baseId);

const branchTimeline = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x'] },
        { id: 't4', type: 'standard', order: 1, channelIds: ['w'] },
    ],
    groups: [],
    channels: [],
};

graph = applyTimelineMutation(graph, branchTimeline);

const baseNode = graph.nodes[baseId];
console.log('BRANCH CREATED:', baseNode.childrenIds.length === 2);

const duplicate = applyTimelineMutation(graph, branchTimeline);
console.log('DUPLICATE COLLAPSE:', Object.keys(duplicate.nodes).length === Object.keys(graph.nodes).length);

const integrityOk = Object.values(graph.nodes).every(
    (node) => node.id === hashTimeline(node.timeline)
);
console.log('SNAPSHOT ID INTEGRITY:', integrityOk);

const evalA = evaluateChannelTimeline(
    graph.nodes[graph.headId].timeline,
    0,
    () => 2,
    (a, b) => a + b
);
const evalB = evaluateChannelTimeline(
    graph.nodes[graph.headId].timeline,
    0,
    () => 2,
    (a, b) => a + b
);
console.log('DETERMINISM UNAFFECTED:', JSON.stringify(evalA) === JSON.stringify(evalB));

const shotTimeline = { shots: [{ id: 's1', startMs: 0, endMs: 1000 }] };
const sceneGraph = [{ id: 'root', type: 'frame', children: [] }];
const exportCheck = runExportStabilityGate({
    timeline: graph.nodes[graph.headId].timeline,
    shotTimeline,
    sceneGraph,
});
console.log('EXPORT STABLE FROM NODE:', exportCheck.allowed === true);
