import test from 'node:test';
import assert from 'node:assert/strict';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { setRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
  addSessionUser,
  getCollaborationSession,
  removeSessionUser,
  startCollaborationSession,
} from '@/platform/collaboration/collaborationSession.js';
import {
  clearEventSyncQueues,
  processInbound,
  queueOutboundEvent,
  receiveRemoteEvent,
} from '@/platform/collaboration/eventSyncEngine.js';
import {
  getPresence,
  removePresence,
  updatePresence,
} from '@/platform/collaboration/presenceRuntime.js';
import {
  getCursors,
  removeCursor,
  updateCursor,
} from '@/platform/collaboration/cursorRuntime.js';
import { EventTypes } from '@/core/events/eventTypes.js';

function createReadyDispatcher() {
  const dispatcher = createEventDispatcher({ headless: true });
  dispatcher.hydrateRuntimeState({ nodes: {}, rootIds: [] }, { animate: false });
  setRuntimeDispatcher(dispatcher);
  clearEventSyncQueues();
  return dispatcher;
}

test('collaboration session, presence, and cursors live in reducer-owned runtime state', async () => {
  const dispatcher = createReadyDispatcher();

  await startCollaborationSession({ id: 'session-1' }, { dispatcher });
  await addSessionUser({ id: 'u1', name: 'Ada' }, { dispatcher });
  await updatePresence({ id: 'u1', name: 'Ada' }, { dispatcher });
  await updateCursor('u1', { x: 40, y: 80 }, { dispatcher });

  const runtime = dispatcher.getState();

  assert.equal(getCollaborationSession({ runtimeState: runtime }).id, 'session-1');
  assert.deepEqual(Object.keys(runtime.collaboration.session.users), ['u1']);
  assert.deepEqual(getPresence({ runtimeState: runtime }), [
    {
      id: 'u1',
      name: 'Ada',
      lastSeen: runtime.collaboration.presence.u1.lastSeen,
    },
  ]);
  assert.deepEqual(getCursors({ runtimeState: runtime }), [
    {
      userId: 'u1',
      x: 40,
      y: 80,
      updatedAt: runtime.collaboration.cursors.u1.updatedAt,
    },
  ]);
  assert.equal(useRuntimeStore.getState().collaboration.session.id, 'session-1');
  assert.equal(useRuntimeStore.getState().collaboration.presence.length, 1);
  assert.equal(useRuntimeStore.getState().collaboration.cursors.length, 1);

  await removeCursor('u1', { dispatcher });
  await removePresence('u1', { dispatcher });
  await removeSessionUser('u1', { dispatcher });

  const next = dispatcher.getState();
  assert.deepEqual(next.collaboration.presence, {});
  assert.deepEqual(next.collaboration.cursors, {});
  assert.deepEqual(next.collaboration.session.users, {});
});

test('event sync engine processes inbound remote events in deterministic order through dispatcher', async () => {
  const dispatcher = createReadyDispatcher();
  const dispatched = [];
  const passthroughDispatcher = {
    async dispatch(event) {
      dispatched.push(event);
      return dispatcher.dispatch(event);
    },
  };

  receiveRemoteEvent({
    id: 'b',
    type: EventTypes.COLLABORATION_PRESENCE_UPDATE,
    timestamp: 10,
    payload: { user: { id: 'u2', name: 'Grace', lastSeen: 10 } },
  });
  receiveRemoteEvent({
    id: 'a',
    type: EventTypes.COLLABORATION_SESSION_START,
    timestamp: 10,
    payload: { session: { id: 'session-remote', startedAt: 1 } },
  });

  const processed = await processInbound({ dispatcher: passthroughDispatcher });

  assert.equal(processed, 2);
  assert.deepEqual(
    dispatched.map((event) => ({
      type: event.type,
      sourceEventId: event.meta?.sourceEventId ?? null,
    })),
    [
      {
        type: EventTypes.COLLABORATION_SESSION_START,
        sourceEventId: 'a',
      },
      {
        type: EventTypes.COLLABORATION_PRESENCE_UPDATE,
        sourceEventId: 'b',
      },
    ]
  );

  const runtime = dispatcher.getState();
  assert.equal(runtime.collaboration.session.id, 'session-remote');
  assert.equal(runtime.collaboration.presence.u2.name, 'Grace');
});

test('outbound event queue preserves canonical events for peer transport', async () => {
  clearEventSyncQueues();

  queueOutboundEvent({
    id: 'z',
    type: EventTypes.COLLABORATION_CURSOR_UPDATE,
    timestamp: 20,
    payload: { userId: 'u9', position: { x: 1, y: 2, updatedAt: 20 } },
  });

  const sent = [];
  const flushed = await (await import('@/platform/collaboration/eventSyncEngine.js')).flushOutbound(
    async (event) => {
      sent.push(event);
    }
  );

  assert.equal(flushed, 1);
  assert.equal(sent[0].id, 'z');
  assert.equal(sent[0].type, EventTypes.COLLABORATION_CURSOR_UPDATE);
});
