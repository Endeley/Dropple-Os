import { computeDistanceGuides } from './computeDistanceGuides.js';
import { computeSpacingGuides } from './computeSpacingGuides.js';
import { computeAlignmentClusters } from './computeAlignmentClusters.js';
import { computeGridPatterns } from './computeGridPatterns.js';
import { computeSymmetryAxes } from './computeSymmetryAxes.js';
import { guideAggregator } from './guideAggregator.js';

export function computeGuides({ nodes = [], spatialIndex = null, focusBounds = null } = {}) {
  const sourceNodes = spatialIndex && focusBounds
    ? spatialIndex.query(focusBounds)
    : nodes;

  const guides = [
    ...computeDistanceGuides({ nodes: sourceNodes, axis: 'x' }),
    ...computeDistanceGuides({ nodes: sourceNodes, axis: 'y' }),
    ...computeSpacingGuides({ nodes: sourceNodes, axis: 'x' }),
    ...computeSpacingGuides({ nodes: sourceNodes, axis: 'y' }),
    ...computeAlignmentClusters({ nodes: sourceNodes, axis: 'x' }),
    ...computeAlignmentClusters({ nodes: sourceNodes, axis: 'y' }),
    ...computeGridPatterns({ nodes: sourceNodes }),
    ...computeSymmetryAxes({ nodes: sourceNodes, axis: 'vertical' }),
    ...computeSymmetryAxes({ nodes: sourceNodes, axis: 'horizontal' }),
  ];

  return guideAggregator({ guides });
}
