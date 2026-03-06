export function distributeNodes(nodes = [], axis) {
  if (!Array.isArray(nodes) || nodes.length < 3) return [];

  const ordered = [...nodes].sort((a, b) => {
    const aLayout = a?.layout || {};
    const bLayout = b?.layout || {};
    const aPos = axis === 'x' ? (aLayout.x ?? a?.x ?? 0) : (aLayout.y ?? a?.y ?? 0);
    const bPos = axis === 'x' ? (bLayout.x ?? b?.x ?? 0) : (bLayout.y ?? b?.y ?? 0);
    if (aPos !== bPos) return aPos - bPos;
    return String(a?.id).localeCompare(String(b?.id));
  });

  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  if (!first || !last) return [];

  const firstLayout = first.layout || {};
  const lastLayout = last.layout || {};

  const start = axis === 'x'
    ? (firstLayout.x ?? first?.x ?? 0)
    : (firstLayout.y ?? first?.y ?? 0);

  const end = axis === 'x'
    ? (lastLayout.x ?? last?.x ?? 0) + (lastLayout.width ?? last?.width ?? 0)
    : (lastLayout.y ?? last?.y ?? 0) + (lastLayout.height ?? last?.height ?? 0);

  const totalSize = ordered.reduce((sum, node) => {
    const layout = node?.layout || {};
    const size = axis === 'x'
      ? (layout.width ?? node?.width ?? 0)
      : (layout.height ?? node?.height ?? 0);
    return sum + size;
  }, 0);

  const gap = (end - start - totalSize) / (ordered.length - 1);

  let cursor = start;
  return ordered.map((node) => {
    const layout = node?.layout || {};
    const width = layout.width ?? node?.width ?? 0;
    const height = layout.height ?? node?.height ?? 0;

    const next = axis === 'x'
      ? { x: cursor, y: layout.y ?? node?.y ?? 0 }
      : { x: layout.x ?? node?.x ?? 0, y: cursor };

    cursor += (axis === 'x' ? width : height) + gap;

    return { id: node.id, x: next.x, y: next.y };
  });
}
