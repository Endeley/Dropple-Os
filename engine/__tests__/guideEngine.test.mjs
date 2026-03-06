import { computeDistanceGuides } from '../guides/computeDistanceGuides.js';
import { guideAggregator } from '../guides/guideAggregator.js';

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

const nodes = [
  { id: 'a', x: 0, y: 0, width: 100, height: 100 },
  { id: 'b', x: 140, y: 0, width: 100, height: 100 },
  { id: 'c', x: 280, y: 0, width: 100, height: 100 },
];

const guidesA = guideAggregator({
  guides: [
    ...computeDistanceGuides({ nodes, axis: 'x' }),
  ],
});

const guidesB = guideAggregator({
  guides: [
    ...computeDistanceGuides({ nodes: clone(nodes), axis: 'x' }),
  ],
});

console.log(
  'GUIDE DETERMINISM:',
  JSON.stringify(guidesA) === JSON.stringify(guidesB)
);
