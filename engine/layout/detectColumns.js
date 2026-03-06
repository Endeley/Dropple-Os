export function detectColumns(guides = []) {
  if (!Array.isArray(guides)) return [];

  const layouts = [];

  guides.forEach((guide) => {
    if (guide?.type !== 'alignmentCluster' || guide.axis !== 'x') return;
    const nodes = Array.isArray(guide.nodes) ? [...guide.nodes] : [];
    if (nodes.length < 2) return;

    layouts.push({
      type: 'layoutInference',
      layout: 'column',
      nodes: nodes.sort(),
    });
  });

  return layouts;
}
