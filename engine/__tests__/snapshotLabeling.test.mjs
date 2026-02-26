import { hashTimeline } from '../../domain/timeline/TimelineContract.js';
import {
    createTimelineController,
    setSnapshotLabel,
} from '../../engine/timeline/timelineController.js';
import { runExportStabilityGate } from '../../engine/export/exportStabilityGate.js';

const base = {
    duration: 100,
    tracks: [
        { id: 't1', type: 'standard', order: 0, channelIds: ['x'] },
    ],
    groups: [],
    channels: [],
};

let controller = createTimelineController(base);
const headId = controller.headId;

const shotTimeline = { shots: [{ id: 's1', startMs: 0, endMs: 1000 }] };
const sceneGraph = [{ id: 'root', type: 'frame', children: [] }];

const pre = runExportStabilityGate({
    timeline: controller.snapshotGraph.nodes[controller.headId].timeline,
    shotTimeline,
    sceneGraph,
});

controller = setSnapshotLabel(controller, { snapshotId: headId, label: '  hello  ' });

const post = runExportStabilityGate({
    timeline: controller.snapshotGraph.nodes[controller.headId].timeline,
    shotTimeline,
    sceneGraph,
});

console.log('LABEL DOES NOT CHANGE HEAD:', controller.headId === headId);
console.log('NODE COUNT UNCHANGED:', Object.keys(controller.snapshotGraph.nodes).length === 1);
console.log('LABEL NORMALIZED:', controller.snapshotGraph.meta[headId].label === 'hello');
console.log(
    'HASH UNCHANGED:',
    hashTimeline(controller.snapshotGraph.nodes[headId].timeline) === headId
);
console.log(
    'EXPORT HASH STABLE:',
    pre.timelineHash === post.timelineHash && pre.evaluationHash === post.evaluationHash
);

const long = 'x'.repeat(200);
controller = setSnapshotLabel(controller, { snapshotId: headId, label: long });
console.log('LABEL CLAMPED:', controller.snapshotGraph.meta[headId].label.length === 64);
