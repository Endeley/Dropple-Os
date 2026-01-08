export function computeStateDiff(prev, next) {
  const changes = [];

  for (const id in next.nodes) {
    const a = prev.nodes[id];
    const b = next.nodes[id];

    if (!a && b) {
      changes.push({ type: 'node.created', node: b });
      continue;
    }

    if (a && !b) {
      changes.push({ type: 'node.deleted', nodeId: id });
      continue;
    }

    if (JSON.stringify(a.layout) !== JSON.stringify(b.layout)) {
      changes.push({
        type: 'layout.changed',
        nodeId: id,
        before: a.layout,
        after: b.layout,
      });
    }

    if (a?.content !== b?.content) {
      changes.push({
        type: 'content.changed',
        nodeId: id,
        before: a.content,
        after: b.content,
      });
    }
  }

  return changes;
}
