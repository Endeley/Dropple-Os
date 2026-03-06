import { computeSpacingGuides } from '../guides/computeSpacingGuides.js';
import { guideAggregator } from '../guides/guideAggregator.js';

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

const nodes = [
  { id: 'a', x: 0, y: 0, width: 50, height: 50 },
  { id: 'b', x: 100, y: 0, width: 50, height: 50 },
  { id: 'c', x: 200, y: 0, width: 50, height: 50 },
];

const guidesA = guideAggregator({
  guides: [
    ...computeSpacingGuides({ nodes, axis: 'x', tolerance: 2 }),
  ],
});

const guidesB = guideAggregator({
  guides: [
    ...computeSpacingGuides({ nodes: clone(nodes), axis: 'x', tolerance: 2 }),
  ],
});

console.log(
  'SPACING GUIDE DETERMINISM:',
  JSON.stringify(guidesA) === JSON.stringify(guidesB)
);
