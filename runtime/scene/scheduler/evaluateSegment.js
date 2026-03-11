export function evaluateSegment({
    segment,
    evaluateNode,
    document,
    runtime,
}) {
    const results = {};

    for (const nodeId of segment.nodes) {
        const nextEntry = evaluateNode({
            nodeId,
            document,
            runtime,
        });

        if (nextEntry) {
            results[nodeId] = nextEntry;
        }
    }

    return results;
}
