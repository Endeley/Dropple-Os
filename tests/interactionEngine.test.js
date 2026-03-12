import test from 'node:test';
import assert from 'node:assert/strict';

import { createInteractionEngine } from '@/runtime/interactionEngine/engine.js';
import {
  INTERACTIONS,
  registerInteraction,
  interactionRegistry,
} from '@/runtime/interactionEngine/interactionRegistry.js';
import { InteractionGraph, GraphNode } from '@/runtime/interactionEngine/interactionGraph.js';
import { initialInteractionState } from '@/runtime/interactionEngine/state/interactionState.js';
import { initialPreviewState } from '@/runtime/interactionEngine/state/previewState.js';

test('interaction engine start/update/commit flows through runtime interaction and preview state', () => {
  const runtime = {
    interaction: initialInteractionState(),
    preview: initialPreviewState(),
  };

  const dispatched = [];
  const engine = createInteractionEngine(runtime, (event) => dispatched.push(event));

  registerInteraction(INTERACTIONS.MOVE, (input) =>
    new InteractionGraph([
      new GraphNode('move-preview', ({ pointer }) => {
        if (pointer) {
          return {
            viewport: {
              x: pointer.x,
              y: pointer.y,
            },
          };
        }

        return {
          events: [
            {
              type: 'node/move',
              payload: {
                ids: input.nodeIds,
              },
            },
          ],
        };
      }),
    ])
  );

  engine.start({
    tool: 'move',
    pointer: { x: 10, y: 20 },
    nodeIds: ['node-1'],
  });

  assert.equal(runtime.interaction.activeInteraction, 'move');
  assert.equal(runtime.interaction.phase, 'active');
  assert.deepEqual(runtime.interaction.nodeIds, ['node-1']);

  engine.update({ x: 25, y: 35 });
  assert.deepEqual(runtime.preview.viewport, { x: 25, y: 35 });

  engine.commit();
  assert.equal(dispatched.length, 1);
  assert.equal(dispatched[0].type, 'node/move');
  assert.equal(runtime.interaction.phase, 'idle');
  assert.equal(runtime.preview.viewport, null);

  interactionRegistry.clear();
});

test('interaction engine cancel clears runtime interaction and preview state', () => {
  const runtime = {
    interaction: initialInteractionState(),
    preview: initialPreviewState(),
  };

  registerInteraction(INTERACTIONS.PAN, () => new InteractionGraph());

  const engine = createInteractionEngine(runtime, () => {});

  engine.start({
    tool: 'pan',
    pointer: { x: 1, y: 2 },
  });

  engine.update({ x: 5, y: 6 });
  engine.cancel();

  assert.equal(runtime.interaction.phase, 'idle');
  assert.equal(runtime.interaction.activeInteraction, null);
  assert.equal(runtime.preview.viewport, null);

  interactionRegistry.clear();
});
