import { EventTypes } from '@/core/events/eventTypes.js';
import { getCoreToolHandler } from '@/runtime/input/coreToolHandlers.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readReason(error) {
  return JSON.parse(error.message).reason;
}

function runCommit(inputOverrides = {}, runtimeState = {}) {
  const dispatched = [];
  const handler = getCoreToolHandler('frame');
  const input = {
    type: EventTypes.INPUT_CREATE_COMMIT,
    nodeType: 'frame',
    bounds: { x: 10, y: 20, width: 140, height: 110 },
    parentId: null,
    sessionId: 'frame:1',
    sessionState: { active: true, pointerId: 1 },
    ...inputOverrides,
  };
  const context = {
    dispatcher: {
      dispatch(event) {
        dispatched.push(event);
      },
    },
    runtimeState,
  };
  const result = handler(input, context);
  return { result, dispatched };
}

let missingIdReason = null;
try {
  runCommit({ sessionId: null });
  throw new Error('expected missing session id invariant');
} catch (error) {
  missingIdReason = readReason(error);
}
assert(missingIdReason === 'MISSING_SESSION_ID', 'missing session id should be rejected deterministically');

let inactiveReason = null;
try {
  runCommit({ sessionState: { active: false, pointerId: 1 } });
  throw new Error('expected inactive session invariant');
} catch (error) {
  inactiveReason = readReason(error);
}
assert(inactiveReason === 'SESSION_NOT_ACTIVE_AT_COMMIT', 'inactive session should be rejected deterministically');

const runtimeState = {};
const first = runCommit({}, runtimeState);
assert(first.result?.handled === true, 'first commit should be handled');
assert(first.dispatched.length === 1, 'first commit should dispatch one event');
assert(first.dispatched[0].type === EventTypes.NODE_CREATE, 'first commit should dispatch node create');

let duplicateReason = null;
try {
  runCommit({}, runtimeState);
  throw new Error('expected duplicate commit invariant');
} catch (error) {
  duplicateReason = readReason(error);
}
assert(duplicateReason === 'COMMIT_ALREADY_FINALIZED', 'duplicate commit should be rejected deterministically');

console.log('CREATE SESSION COMMIT BRIDGE GUARDS: true');

