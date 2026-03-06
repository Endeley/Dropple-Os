import { createSpatialIndex } from '../spatial/spatialIndex.js';

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

const nodes = [
  { id: 'b', x: 200, y: 0, width: 50, height: 50 },
  { id: 'a', x: 0, y: 0, width: 50, height: 50 },
  { id: 'c', x: 100, y: 100, width: 50, height: 50 },
];

const bounds = { minX: -10, minY: -10, maxX: 260, maxY: 160 };

const indexA = createSpatialIndex(nodes, 100);
const indexB = createSpatialIndex(clone(nodes), 100);

const resultA = indexA.query(bounds).map((n) => n.id);
const resultB = indexB.query(bounds).map((n) => n.id);

console.log(
  'SPATIAL INDEX DETERMINISM:',
  JSON.stringify(resultA) === JSON.stringify(resultB)
);
