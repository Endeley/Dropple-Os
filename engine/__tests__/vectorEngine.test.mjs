import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { setRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
  clearVectorRegistry,
  getAllVectors as getRegisteredVectors,
  getVector as getRegisteredVector,
  registerVector,
} from '@/engine/vector/vectorRegistry.js';
import { rectanglePath, circlePath, linePath } from '@/engine/vector/pathEngine.js';
import { union, subtract, intersect } from '@/engine/vector/booleanEngine.js';
import { getAllVectors, getVector } from '@/engine/vector/vectorSelectors.js';
import { createVector, updateVector, deleteVector } from '@/engine/vector/vectorRuntime.js';
import { EventTypes } from '@/core/events/eventTypes.js';

test('vector runtime creates updates and deletes document-owned vectors through dispatcher', async () => {
  const dispatcher = createEventDispatcher({ headless: true });
  dispatcher.hydrateRuntimeState({ nodes: {}, rootIds: [], document: { vectors: {} } }, { animate: false });
  setRuntimeDispatcher(dispatcher);
  await dispatcher.dispatch({
    type: EventTypes.WORKSPACE_SET_ACTIVE,
    payload: {
      workspaceDef: {
        id: 'icons',
        policy: {
          capabilities: ['vector:create', 'vector:mutate', 'vector:delete'],
        },
      },
    },
  });

  await createVector(
    {
      id: 'rect1',
      type: 'path',
      path: rectanglePath(10, 10, 200, 100),
      fill: '#00f',
      stroke: '#000',
    },
    { dispatcher }
  );

  let runtime = dispatcher.getState();
  assert.equal(getVector(runtime.document, 'rect1').fill, '#00f');
  assert.equal(runtime.vectors.rect1.stroke, '#000');
  assert.equal(useRuntimeStore.getState().vectors.rect1.type, 'path');

  await updateVector('rect1', { fill: '#0f0' }, { dispatcher });
  runtime = dispatcher.getState();
  assert.equal(getVector(runtime.document, 'rect1').fill, '#0f0');

  await deleteVector('rect1', { dispatcher });
  runtime = dispatcher.getState();
  assert.equal(getVector(runtime.document, 'rect1'), null);
  assert.deepEqual(getAllVectors(runtime.document), []);

  const storeEvents = useRuntimeStore.getState().events;
  assert.equal(storeEvents[0].type, EventTypes.VECTOR_CREATE);
  assert.equal(storeEvents[1].type, EventTypes.VECTOR_UPDATE);
  assert.equal(storeEvents[2].type, EventTypes.VECTOR_DELETE);
});

test('path and boolean engines produce deterministic vector primitives', () => {
  assert.equal(rectanglePath(0, 0, 10, 20), 'M0 0 L10 0 L10 20 L0 20 Z');
  assert.equal(circlePath(10, 10, 5), 'M5 10 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0');
  assert.equal(linePath(1, 2, 3, 4), 'M1 2 L3 4');

  assert.equal(union('A', 'B'), 'A B');
  assert.deepEqual(subtract('A', 'B'), { type: 'subtract', a: 'A', b: 'B' });
  assert.deepEqual(intersect('A', 'B'), { type: 'intersect', a: 'A', b: 'B' });
});

test('vector registry remains deterministic for asset catalogs', () => {
  clearVectorRegistry();

  registerVector({ id: 'b', type: 'path', path: 'B' });
  registerVector({ id: 'a', type: 'path', path: 'A' });

  assert.equal(getRegisteredVector('a').path, 'A');
  assert.deepEqual(
    getRegisteredVectors().map((vector) => vector.id),
    ['a', 'b']
  );
});
