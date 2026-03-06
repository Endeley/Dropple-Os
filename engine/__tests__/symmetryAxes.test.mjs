import { computeSymmetryAxes } from '../guides/computeSymmetryAxes.js';
import { guideAggregator } from '../guides/guideAggregator.js';

const nodes = [
  { id: 'a', x: 100, y: 0, width: 50, height: 50 },
  { id: 'b', x: 300, y: 0, width: 50, height: 50 },
  { id: 'c', x: 200, y: 100, width: 50, height: 50 },
];

const guidesA = guideAggregator({
  guides: [
    ...computeSymmetryAxes({ nodes, axis: 'vertical', tolerance: 2 }),
  ],
});

const guidesB = guideAggregator({
  guides: [
    ...computeSymmetryAxes({ nodes: [...nodes], axis: 'vertical', tolerance: 2 }),
  ],
});

console.log(
  'SYMMETRY AXIS DETERMINISM:',
  JSON.stringify(guidesA) === JSON.stringify(guidesB)
);
