export function computeSnapPoints(state, excludeId) {
  const xs = [];
  const ys = [];

  for (const node of Object.values(state.nodes)) {
    if (node.id === excludeId) continue;
    if (!node.layout) continue;

    const { x = 0, y = 0, width = 0, height = 0 } = node.layout;

    xs.push(x, x + width / 2, x + width);
    ys.push(y, y + height / 2, y + height);
  }

  return { xs, ys };
}
