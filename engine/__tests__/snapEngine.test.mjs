import { resolveSnap } from '@/engine/constraints/snapEngine.js';

const candidates = [
  { nodeId: 'a', bounds: { x: 10, y: 10, width: 100, height: 50 } },
  { nodeId: 'b', bounds: { x: 200, y: 20, width: 80, height: 60 } },
];

const grid = resolveSnap({
  pointerWorld: { x: 12.2, y: 18.7 },
  nodeBounds: null,
  candidates: [],
  gridSize: 10,
  threshold: 6,
});

console.log('GRID SNAP STABLE:', grid.snappedPoint.x === 10 && grid.snappedPoint.y === 20);

const objectSnap = resolveSnap({
  pointerWorld: { x: 9.6, y: 10.2 },
  nodeBounds: null,
  candidates,
  gridSize: null,
  threshold: 2,
});

console.log('OBJECT SNAP STABLE:', objectSnap.snappedPoint.x === 10);
console.log('GUIDE GENERATION STABLE:', objectSnap.guides.length > 0);

const hashA = JSON.stringify(objectSnap);
const hashB = JSON.stringify(resolveSnap({
  pointerWorld: { x: 9.6, y: 10.2 },
  nodeBounds: null,
  candidates,
  gridSize: null,
  threshold: 2,
}));

console.log('SNAP HASH DETERMINISTIC:', hashA === hashB);
