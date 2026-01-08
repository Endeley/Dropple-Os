'use client';

import { useEffect, useRef, useState } from 'react';
import { ModeRegistry } from '@/workspaces/modes/ModeRegistry';
import { WorkspaceLayout } from './WorkspaceLayout';
import { MessageBus } from '@/runtime/MessageBus';

export function WorkspaceShell({ modeId }) {
  const adapter = ModeRegistry.get(modeId);

  const busRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [cursorIndex, setCursorIndex] = useState(-1);

  if (!busRef.current) {
    busRef.current = new MessageBus({ runId: 'design-run' });

    busRef.current.listeners.add((event) => {
      setEvents((prev) => {
        const next = [...prev, event];
        setCursorIndex(next.length - 1);
        return next;
      });
    });
  }

  const bus = busRef.current;

  useEffect(() => {
    if (events.length > 0) return;

    bus.emit({
      type: 'node.create',
      payload: {
        node: {
          id: 'frame-root',
          type: 'frame',
          layout: { x: 0, y: 0, width: 600, height: 400 },
        },
      },
    });

    bus.emit({
      type: 'node.create',
      payload: {
        node: {
          id: 'frame-secondary',
          type: 'frame',
          layout: { x: 800, y: 200, width: 400, height: 300 },
        },
      },
    });
  }, [events.length, bus]);

  const cursor = {
    index: cursorIndex,
  };

  return (
    <WorkspaceLayout
      adapter={adapter}
      events={events}
      cursor={cursor}
      setCursorIndex={setCursorIndex}
      emit={bus.emit.bind(bus)}
    />
  );
}
