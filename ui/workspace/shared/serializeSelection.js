import { getNode } from '@/runtime/document/documentAdapter';

export function serializeSelection({ state, selectedIds }) {
  const nodes = [];
  const rootIds = [];

  selectedIds.forEach((id) => {
    const node = getNode(state, id);
    if (!node) return;

    nodes.push(structuredClone(node));

    if (!node.parentId || !selectedIds.has(node.parentId)) {
      rootIds.push(id);
    }
  });

  return { nodes, rootIds };
}
