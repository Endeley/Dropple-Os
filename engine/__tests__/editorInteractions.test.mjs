import { applyMoveConstraints } from '@/engine/constraints/constraintEngine.js';
import { alignNodes } from '@/engine/alignment/alignNodes.js';
import { distributeNodes } from '@/engine/alignment/distributeNodes.js';

// Smoke tests for editor interaction math (snap + alignment + distribution).

// Test 1 — Multi-node move snap
{
  const nodes = [
    { id: 'a', x: 0, y: 0, width: 100, height: 100 },
    { id: 'c', x: 120, y: 0, width: 100, height: 100 },
  ];
  const siblings = [{ id: 'b', x: 200, y: 0, width: 100, height: 100 }];

  const delta = { x: 195, y: 0 };
  const result = applyMoveConstraints({
    delta,
    nodes,
    siblings,
    options: { snapRadius: 10 },
  });

  if (!result.guides || result.guides.length === 0) {
    throw new Error('multi-node move snap: expected guides');
  }
  if (result.delta.x !== 200) {
    throw new Error(`multi-node move snap: expected delta.x=200, got ${result.delta.x}`);
  }
}

// Test 2 — Align left
{
  const nodes = [
    { id: 'a', layout: { x: 100, y: 0, width: 50, height: 50 } },
    { id: 'b', layout: { x: 200, y: 0, width: 50, height: 50 } },
  ];

  const result = alignNodes(nodes, 'alignLeft');
  const next = new Map(result.map((r) => [r.id, r.x]));

  if (next.get('a') !== next.get('b')) {
    throw new Error('align left: expected x positions to match');
  }
}

// Test 3 — Distribute horizontal
{
  const nodes = [
    { id: 'a', layout: { x: 0, y: 0, width: 50, height: 50 } },
    { id: 'b', layout: { x: 200, y: 0, width: 50, height: 50 } },
    { id: 'c', layout: { x: 400, y: 0, width: 50, height: 50 } },
  ];

  const result = distributeNodes(nodes, 'x');
  if (result.length !== 3) {
    throw new Error(`distribute horizontal: expected 3 results, got ${result.length}`);
  }

  const byId = new Map(result.map((r) => [r.id, r]));
  if (byId.get('a')?.x !== 0 || byId.get('b')?.x !== 200 || byId.get('c')?.x !== 400) {
    throw new Error('distribute horizontal: unexpected x positions');
  }
}

console.log('✅ editor interaction smoke tests passed');
