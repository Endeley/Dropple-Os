import { attachNode } from '@/core/structure/attachNode.js';
import { detachNode } from '@/core/structure/detachNode.js';
import { reparentNode } from '@/core/structure/reparentNode.js';
import { reorderNode } from '@/core/structure/reorderNode.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const baseNodes = {
  root: { id: 'root', children: ['a', 'b'] },
  a: { id: 'a', parentId: 'root', children: [] },
  b: { id: 'b', parentId: 'root', children: [] },
  c: { id: 'c', parentId: null, children: [] },
};

const attachResult = attachNode({
  nodes: baseNodes,
  rootIds: ['root', 'c'],
  parentId: 'root',
  childId: 'c',
  index: 1,
});

assert(attachResult.nodes.root.children.join(',') === 'a,c,b', 'attach should insert child at index');
assert(attachResult.nodes.c.parentId === 'root', 'attach should update parentId');
assert(attachResult.rootIds.join(',') === 'root', 'attach should remove attached node from rootIds');
console.log('STRUCTURE ATTACH: true');

const detachResult = detachNode({
  nodes: attachResult.nodes,
  rootIds: attachResult.rootIds,
  nodeId: 'c',
});

assert(detachResult.nodes.root.children.join(',') === 'a,b', 'detach should remove child from parent');
assert(detachResult.nodes.c.parentId === null, 'detach should clear parentId');
assert(detachResult.rootIds.includes('c'), 'detach should restore rootId');
console.log('STRUCTURE DETACH: true');

const reparentResult = reparentNode({
  nodes: {
    ...baseNodes,
    frame: { id: 'frame', parentId: null, children: [] },
  },
  rootIds: ['root', 'frame'],
  nodeId: 'b',
  parentId: 'frame',
  index: 0,
});

assert(reparentResult.nodes.root.children.join(',') === 'a', 'reparent should remove node from old parent');
assert(reparentResult.nodes.frame.children.join(',') === 'b', 'reparent should attach node to new parent');
assert(reparentResult.nodes.b.parentId === 'frame', 'reparent should update parentId');
console.log('STRUCTURE REPARENT: true');

const reorderResult = reorderNode({
  nodes: {
    root: { id: 'root', children: ['a', 'b', 'c'] },
    a: { id: 'a', parentId: 'root' },
    b: { id: 'b', parentId: 'root' },
    c: { id: 'c', parentId: 'root' },
  },
  containerId: 'root',
  nodeIds: ['c'],
  index: 0,
});

assert(reorderResult.root.children.join(',') === 'c,a,b', 'reorder should move child inside same parent');
console.log('STRUCTURE REORDER: true');
