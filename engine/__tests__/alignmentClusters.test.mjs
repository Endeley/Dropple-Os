import { computeAlignmentClusters } from '../guides/computeAlignmentClusters.js';

const nodes = [
  { id: 'c', x: 100, y: 200, width: 50, height: 50 },
  { id: 'a', x: 100, y: 0, width: 50, height: 50 },
  { id: 'b', x: 100, y: 100, width: 50, height: 50 },
];

const clustersA = computeAlignmentClusters({ nodes, axis: 'x' });
const clustersB = computeAlignmentClusters({ nodes: [...nodes], axis: 'x' });

console.log(
  'ALIGNMENT CLUSTER DETERMINISM:',
  JSON.stringify(clustersA) === JSON.stringify(clustersB)
);
