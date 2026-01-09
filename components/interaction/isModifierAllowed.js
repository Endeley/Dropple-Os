export function modifiersAllowed(node, nodes) {
  if (!node?.parentId) return true;
  const parent = nodes[node.parentId];
  return !parent?.layout.autoLayout;
}
