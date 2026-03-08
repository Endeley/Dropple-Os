import { unwrapNode } from '@/core/structure/unwrapNode.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const state = {
  nodes: {
    parent: { id: 'parent', children: ['a', 'group_1', 'd'] },
    a: { id: 'a', parentId: 'parent', children: [] },
    group_1: { id: 'group_1', parentId: 'parent', children: ['b', 'c'] },
    b: { id: 'b', parentId: 'group_1', children: [] },
    c: { id: 'c', parentId: 'group_1', children: [] },
    d: { id: 'd', parentId: 'parent', children: [] },
  },
  rootIds: ['parent'],
};

const unwrapped = unwrapNode({
  nodes: state.nodes,
  rootIds: state.rootIds,
  nodeId: 'group_1',
});

assert(unwrapped.nodes.parent.children.join(',') === 'a,b,c,d', 'unwrap should preserve child order at wrapper index');
assert(unwrapped.nodes.b.parentId === 'parent', 'unwrap should move first child to parent');
assert(unwrapped.nodes.c.parentId === 'parent', 'unwrap should move second child to parent');
assert(!unwrapped.nodes.group_1, 'unwrap should remove wrapper node');

console.log('UNWRAP NODE ORDER PRESERVED: true');
