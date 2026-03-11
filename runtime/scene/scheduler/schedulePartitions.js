import { evaluateNode } from '../evaluateNode.js';
import { runPartitionTask } from './defaultScheduler.js';
import { evaluateSegment } from './evaluateSegment.js';
import { frontierSegmentSchedule } from './frontierSegmentSchedule.js';

export function schedulePartitions({
    partitions,
    layers,
    dirtyNodes,
    segments,
    nodeToSegment,
    segmentGraph,
    document,
    runtime,
}) {
    const results = {};

    for (const partition of partitions) {
        const allowedSegments = new Set(
            [...partition.nodes]
                .map((nodeId) => nodeToSegment.get(nodeId))
                .filter(Boolean),
        );
        const affectedSegments = frontierSegmentSchedule({
            dirtyNodes,
            nodeToSegment,
            segmentGraph,
            allowedSegments,
        });
        const partitionResults = {};
        const processedSegments = new Set();

        for (const layer of layers) {
            for (const nodeId of layer) {
                const segmentId = nodeToSegment.get(nodeId);
                if (!segmentId || !affectedSegments.has(segmentId)) continue;
                if (processedSegments.has(segmentId)) continue;

                const segment = segments.get(segmentId);
                if (!segment) continue;

                const segmentResults = evaluateSegment({
                    segment,
                    evaluateNode,
                    document,
                    runtime,
                });

                Object.assign(partitionResults, segmentResults);
                processedSegments.add(segmentId);
            }
        }

        Object.assign(results, partitionResults);
    }

    return results;
}
