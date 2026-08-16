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
    sessionState: {
      active: true,
      pointerId: 1,
      federationSnapshot: {
        envelope: {
          sessionId: 'frame:1',
          phase: 'committed',
        },
      },
    },
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

let federationMismatchReason = null;
try {
  runCommit({
    sessionState: {
      active: true,
      pointerId: 1,
      federationSnapshot: {
        envelope: { sessionId: 'frame:other', phase: 'committed' },
      },
    },
  });
  throw new Error('expected federation mismatch invariant');
} catch (error) {
  federationMismatchReason = readReason(error);
}
assert(
  federationMismatchReason === 'FEDERATION_SESSION_MISMATCH',
  'federation session id mismatch should be rejected deterministically',
);

let federationPhaseReason = null;
try {
  runCommit({
    sessionState: {
      active: true,
      pointerId: 1,
      federationSnapshot: {
        envelope: { sessionId: 'frame:1', phase: 'preview' },
      },
    },
  });
  throw new Error('expected federation phase invariant');
} catch (error) {
  federationPhaseReason = readReason(error);
}
assert(
  federationPhaseReason === 'FEDERATION_NOT_COMMITTED',
  'federation phase must be committed at create-session commit',
);

const runtimeState = {};
const first = runCommit({}, runtimeState);
assert(first.result?.handled === true, 'first commit should be handled');
assert(first.dispatched.length === 2, 'first commit should dispatch create and selection events');
assert(first.dispatched[0].type === EventTypes.NODE_CREATE, 'first event should dispatch node create');
assert(first.dispatched[1].type === EventTypes.SELECTION_SET, 'second event should dispatch selection set');

const createdNodeId = first.dispatched[0]?.payload?.node?.id ?? null;
assert(typeof createdNodeId === 'string' && createdNodeId.length > 0, 'create event should emit a node id');
assert(
  Array.isArray(first.dispatched[1]?.payload?.ids) && first.dispatched[1].payload.ids.length === 1,
  'selection set should target exactly one created node',
);
assert(
  first.dispatched[1].payload.ids[0] === createdNodeId,
  'selection set should target the node created by the first event',
);
assert(
  first.dispatched[1]?.payload?.primary === createdNodeId,
  'selection primary should match the created node id',
);

let duplicateReason = null;
try {
  runCommit({}, runtimeState);
  throw new Error('expected duplicate commit invariant');
} catch (error) {
  duplicateReason = readReason(error);
}
assert(duplicateReason === 'COMMIT_ALREADY_FINALIZED', 'duplicate commit should be rejected deterministically');
const ledger = runtimeState.__createCommitLedger;
assert(ledger instanceof Set, 'runtime ledger should remain deterministic after first commit');
assert(ledger.size === 1 && ledger.has('frame:1'), 'duplicate commit should not add extra finalized sessions');

console.log('CREATE SESSION COMMIT BRIDGE GUARDS: true');
