'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ModeRegistry } from '@/workspaces/modes/ModeRegistry';
import { WorkspaceLayout } from './WorkspaceLayout';
import { MessageBus } from '@/runtime/MessageBus';
import { GridProvider } from './GridContext';
import { ClipboardProvider } from './ClipboardContext';
import { applyAutoLayoutIfNeeded } from './useAutoLayoutCommit';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';
import { EducationCursorProvider } from '@/education/EducationCursorContext';
import TemplateGeneratorOverlay from '@/templates/TemplateGeneratorOverlay';
import { useTemplateGenerator } from '@/templates/useTemplateGenerator';

export function WorkspaceShell({
  modeId,
  educationRole = 'teacher',
  educationInitialLocked = true,
  educationReadOnly = false,
  initialEvents = [],
  initialCursorIndex = -1,
  disableSeed = false,
  reviewSubmission,
  reviewRubric,
  onReviewDecision,
  onReviewCriteriaChange,
}) {
  const adapter = ModeRegistry.get(modeId);
  const templateGen = useTemplateGenerator();

  const busRef = useRef(null);
  const [events, setEvents] = useState(() => initialEvents);
  const [cursorIndex, setCursorIndex] = useState(initialCursorIndex);
  const skipAutoLayoutOnce = useRef(initialEvents.length > 0);

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
    if (events.length === 0) return;
    if (skipAutoLayoutOnce.current) {
      skipAutoLayoutOnce.current = false;
      return;
    }

    const lastEvent = events[events.length - 1];
    if (!lastEvent) return;

    const shouldApply = new Set([
      'node.layout.setAutoLayout',
      'node.layout.clearAutoLayout',
      'node.layout.resize',
      'node.create',
      'node.delete',
      'node.children.reorder',
    ]);

    if (!shouldApply.has(lastEvent.type)) return;

    const state = getDesignStateAtCursor({
      events,
      uptoIndex: events.length - 1,
    });

    applyAutoLayoutIfNeeded({
      state,
      emit: bus.emit.bind(bus),
    });
  }, [events, bus]);

  useEffect(() => {
    if (disableSeed || events.length > 0) return;

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

  const replayState = useMemo(
    () =>
      getDesignStateAtCursor({
        events,
        uptoIndex: cursorIndex,
      }),
    [events, cursorIndex]
  );

  const workspace = (
    <WorkspaceLayout
      adapter={adapter}
      events={events}
      cursor={cursor}
      setCursorIndex={setCursorIndex}
      emit={bus.emit.bind(bus)}
      onOpenTemplateGenerator={templateGen.openGenerator}
      educationReadOnly={educationReadOnly}
      reviewSubmission={reviewSubmission}
      reviewRubric={reviewRubric}
      onReviewDecision={onReviewDecision}
      onReviewCriteriaChange={onReviewCriteriaChange}
    />
  );

  return (
    <GridProvider>
      <ClipboardProvider>
        {modeId === 'education' ? (
          <EducationCursorProvider
            role={educationRole}
            initialLocked={educationInitialLocked}
          >
            {workspace}
          </EducationCursorProvider>
        ) : (
          workspace
        )}
        <TemplateGeneratorOverlay
          open={templateGen.open}
          onClose={templateGen.closeGenerator}
          state={replayState}
          events={events}
          mode={adapter}
        />
      </ClipboardProvider>
    </GridProvider>
  );
}
