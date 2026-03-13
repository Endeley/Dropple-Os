import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { resolveEventOrder } from './conflictResolver.js';

let outbound = [];
let inbound = [];

function cloneEvent(event) {
  return structuredClone(event);
}

function assertEventShape(event) {
  if (!event?.type) {
    throw new Error('Collaboration sync event must include type');
  }
}

function toDispatchableRemoteEvent(event) {
  const { id, ...rest } = event;
  return {
    ...rest,
    meta: {
      ...(rest.meta || {}),
      remote: true,
      sourceEventId: id ?? null,
    },
  };
}

export function queueOutboundEvent(event) {
  assertEventShape(event);
  outbound.push(cloneEvent(event));
}

export function receiveRemoteEvent(event) {
  assertEventShape(event);
  inbound.push(cloneEvent(event));
}

export async function flushOutbound(send) {
  const queue = resolveEventOrder(outbound);
  outbound = [];

  for (const event of queue) {
    await send(event);
  }

  return queue.length;
}

export async function processInbound({ dispatcher } = {}) {
  const activeDispatcher = dispatcher || getRuntimeDispatcher();
  const queue = resolveEventOrder(inbound);
  inbound = [];

  for (const event of queue) {
    await activeDispatcher.dispatch(toDispatchableRemoteEvent(event));
  }

  return queue.length;
}

export function getOutboundQueue() {
  return outbound.map(cloneEvent);
}

export function getInboundQueue() {
  return inbound.map(cloneEvent);
}

export function clearEventSyncQueues() {
  outbound = [];
  inbound = [];
}
