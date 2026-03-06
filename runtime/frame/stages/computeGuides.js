import { computeGuides } from '@/engine/guides/computeGuides.js';
import { createSpatialIndex } from '@/engine/spatial/spatialIndex.js';
import { computeBounds } from '@/engine/spatial/spatialBounds.js';

export function computeGuidesStage(context) {
  const renderGraph = context.renderGraph;
  if (!renderGraph?.nodes) return context;

  const selectionIds = context.runtimeState?.selection?.ids || [];
  const selectedNodes = selectionIds.length
    ? renderGraph.nodes.filter((node) => selectionIds.includes(node.id))
    : [];

  const focusBounds = selectedNodes.length
    ? computeBoundsUnion(selectedNodes)
    : null;

  const spatialIndex = createSpatialIndex(renderGraph.nodes);

  const guides = computeGuides({
    nodes: renderGraph.nodes,
    spatialIndex,
    focusBounds,
  });

  return {
    ...context,
    guides,
    renderGraph: {
      ...renderGraph,
      guides,
    },
  };
}

function computeBoundsUnion(nodes) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const b = computeBounds(node);
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  });

  if (!Number.isFinite(minX)) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}
