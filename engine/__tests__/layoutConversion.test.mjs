import { convertLayout } from '../layout/convertLayout.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const nodesById = {
  a: { id: 'a', layout: { x: 0, y: 0, width: 80, height: 40 } },
  b: { id: 'b', layout: { x: 100, y: 0, width: 80, height: 40 } },
  c: { id: 'c', layout: { x: 200, y: 0, width: 80, height: 40 } },
};

const input = {
  layout: 'row',
  nodeIds: ['a', 'b', 'c'],
  nodesById,
  containerId: 'layout-1',
};

const planA = convertLayout(input);
const planB = convertLayout({ ...clone(input), nodesById: clone(nodesById) });

console.log(
  'LAYOUT CONVERSION DETERMINISTIC:',
  JSON.stringify(planA) === JSON.stringify(planB)
);
