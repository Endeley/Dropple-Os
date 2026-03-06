import { computeGridPatterns } from '../guides/computeGridPatterns.js';
import { guideAggregator } from '../guides/guideAggregator.js';

const nodes = [
  { id: 'a', x: 0, y: 0, width: 50, height: 50 },
  { id: 'b', x: 100, y: 0, width: 50, height: 50 },
  { id: 'c', x: 200, y: 0, width: 50, height: 50 },
  { id: 'd', x: 0, y: 100, width: 50, height: 50 },
  { id: 'e', x: 100, y: 100, width: 50, height: 50 },
  { id: 'f', x: 200, y: 100, width: 50, height: 50 },
];

const guidesA = guideAggregator({
  guides: computeGridPatterns({ nodes }),
});

const guidesB = guideAggregator({
  guides: computeGridPatterns({ nodes: [...nodes] }),
});

console.log(
  'GRID PATTERN DETERMINISM:',
  JSON.stringify(guidesA) === JSON.stringify(guidesB)
);
