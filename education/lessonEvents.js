function createEvent(type, payload) {
  return {
    id: crypto.randomUUID(),
    type,
    payload,
  };
}

export function normalizeEvents(events = []) {
  return events.map((event) => ({
    id: event.id || crypto.randomUUID(),
    ...event,
  }));
}

export function snapshotToEvents(snapshot) {
  if (!snapshot?.nodes) return [];

  const events = [];
  const visited = new Set();
  const roots = snapshot.rootIds?.length
    ? snapshot.rootIds
    : Object.keys(snapshot.nodes);

  function addNode(nodeId) {
    if (visited.has(nodeId)) return;
    const node = snapshot.nodes[nodeId];
    if (!node) return;
    visited.add(nodeId);

    const payloadNode = structuredClone({
      ...node,
      children: [],
    });

    events.push(createEvent('node.create', { node: payloadNode }));

    const children = Array.isArray(node.children) ? node.children : [];
    children.forEach(addNode);
  }

  roots.forEach(addNode);

  return events;
}
