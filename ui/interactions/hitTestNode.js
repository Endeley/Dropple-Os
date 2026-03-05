export function getNodeRect(node) {
  const p = node?.props || {};
  const l = node?.layout || {};
  const x = node.x ?? l.x ?? p.x ?? 0;
  const y = node.y ?? l.y ?? p.y ?? 0;
  const width = node.width ?? l.width ?? p.width ?? 0;
  const height = node.height ?? l.height ?? p.height ?? 0;
  return { x, y, width, height };
}

export function pointInRect(pt, r) {
  return pt.x >= r.x && pt.x <= r.x + r.width && pt.y >= r.y && pt.y <= r.y + r.height;
}

export function hitTestNode(runtimeState, worldPoint) {
  const nodesMap = runtimeState?.nodes || {};
  const nodes = Object.values(nodesMap);

  const hits = [];
  for (const node of nodes) {
    const rect = getNodeRect(node);
    if (rect.width <= 0 || rect.height <= 0) continue;
    if (pointInRect(worldPoint, rect)) hits.push({ node, rect });
  }

  if (hits.length === 0) return null;

  hits.sort((a, b) => {
    const az = a.node?.zIndex ?? a.node?.props?.zIndex ?? 0;
    const bz = b.node?.zIndex ?? b.node?.props?.zIndex ?? 0;
    if (az !== bz) return az - bz;
    return 0;
  });

  return hits[hits.length - 1].node;
}
