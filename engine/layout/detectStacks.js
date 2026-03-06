export function detectStacks(guides = []) {
  if (!Array.isArray(guides)) return [];

  const layouts = [];

  guides.forEach((guide) => {
    if (guide?.type !== 'equalSpacing') return;
    const nodes = Array.isArray(guide.nodes) ? [...guide.nodes] : [];
    if (nodes.length < 3) return;

    const layout = guide.axis === 'y' ? 'column' : 'row';
    layouts.push({
      type: 'layoutInference',
      layout,
      nodes: nodes.sort(),
    });
  });

  return layouts;
}
