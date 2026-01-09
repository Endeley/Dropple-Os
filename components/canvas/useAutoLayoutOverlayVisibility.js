export function shouldShowAutoLayoutOverlay({
  selectedIds,
  nodes,
  isPreview,
}) {
  if (isPreview) return false;
  if (selectedIds.size !== 1) return false;

  const [id] = selectedIds;
  const node = nodes[id];
  if (!node) return false;

  return !!node.layout.autoLayout;
}
