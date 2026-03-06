export function detectGrids(guides = []) {
  if (!Array.isArray(guides)) return [];

  const layouts = [];

  guides.forEach((guide) => {
    if (guide?.type !== 'gridPattern') return;
    const nodes = Array.isArray(guide.nodes) ? [...guide.nodes] : [];
    if (nodes.length < 4) return;

    layouts.push({
      type: 'layoutInference',
      layout: 'grid',
      rows: guide.rows,
      columns: guide.columns,
      nodes: nodes.sort(),
    });
  });

  return layouts;
}
