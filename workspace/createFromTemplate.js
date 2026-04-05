/**
 * Create an event INTENT.
 *
 * IMPORTANT:
 * - This function MUST NOT generate IDs.
 * - IDs are assigned by the dispatcher/sequencer.
 */
function createEventIntent(type, payload) {
  return {
    type,
    payload,
  };
}

/**
 * Normalize legacy events into dispatcher-ready intents.
 *
 * IDs are NOT generated here.
 * Dispatcher will assign IDs during dispatch.
 */
function normalizeEvents(events = []) {
  return events.map((event) => {
    const { id, ...rest } = event;
    return rest;
  });
}

function snapshotToEvents(snapshot) {
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

    events.push(createEventIntent('node.create', { node: payloadNode }));

    const children = Array.isArray(node.children) ? node.children : [];
    children.forEach(addNode);
  }

  roots.forEach(addNode);

  return events;
}

export function createWorkspaceFromTemplate(template) {
  const snapshotEvents = template.baseSnapshot
    ? snapshotToEvents(template.baseSnapshot)
    : [];
  const timelineEvents = normalizeEvents(template.eventTimeline || []);

  return {
    id: crypto.randomUUID(),
    mode: template.mode || 'design',
    snapshot: template.baseSnapshot ? structuredClone(template.baseSnapshot) : null,
    events: [...snapshotEvents, ...timelineEvents],
    forkedFrom: template.id,
  };
}
