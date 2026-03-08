import { wrapNodes } from '@/core/structure/wrapNodes.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const state = {
  nodes: {
    parent: { id: 'parent', children: ['a', 'b', 'c', 'd'] },
    a: { id: 'a', parentId: 'parent', children: [] },
    b: { id: 'b', parentId: 'parent', children: [] },
    c: { id: 'c', parentId: 'parent', children: [] },
    d: { id: 'd', parentId: 'parent', children: [] },
  },
  rootIds: ['parent'],
};

const wrapped = wrapNodes({
  nodes: state.nodes,
  rootIds: state.rootIds,
  nodeIds: ['b', 'c'],
  wrapperNode: { id: 'group_1', type: 'group' },
  parentId: 'parent',
  index: 3,
});

assert(wrapped.nodes.parent.children.join(',') === 'a,group_1,d', 'wrapper should replace wrapped range');
assert(wrapped.nodes.group_1.children.join(',') === 'b,c', 'wrapper should preserve child order');
assert(wrapped.nodes.group_1.parentId === 'parent', 'wrapper should inherit parent');
assert(wrapped.nodes.b.parentId === 'group_1', 'wrapped child should point at wrapper');
assert(wrapped.nodes.c.parentId === 'group_1', 'wrapped child should point at wrapper');

console.log('WRAP NODES ORDER PRESERVED: true');
