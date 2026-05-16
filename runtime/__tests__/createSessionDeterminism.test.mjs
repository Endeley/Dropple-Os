import { createNodeCreateEvent } from '@/runtime/input/nodeCreateRuntimeBridge.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function failWithNonPositiveLayout() {
  try {
    createNodeCreateEvent({
      type: 'frame',
      bounds: { x: 0, y: 0, width: 0, height: 100 },
    });
    throw new Error('expected NON_POSITIVE_LAYOUT invariant');
  } catch (error) {
    return error.message;
  }
}

const failureA = failWithNonPositiveLayout();
const failureB = failWithNonPositiveLayout();
assert(failureA === failureB, 'create-session invariant failure payload should be deterministic');

const payload = JSON.parse(failureA);
assert(payload.scope === 'create-session', 'failure scope should match');
assert(payload.reason === 'NON_POSITIVE_LAYOUT', 'failure reason should match');
assert(payload.details?.layout?.width === 0, 'failure details should include stable layout');

const successA = createNodeCreateEvent({
  id: 'node-fixed-a',
  type: 'frame',
  bounds: { x: 12, y: 22, width: 140, height: 110 },
});
const successB = createNodeCreateEvent({
  id: 'node-fixed-a',
  type: 'frame',
  bounds: { x: 12, y: 22, width: 140, height: 110 },
});

assert(
  JSON.stringify(successA.event) === JSON.stringify(successB.event),
  'create-session success event should remain deterministic for fixed inputs',
);

console.log('CREATE SESSION DETERMINISM: true');

