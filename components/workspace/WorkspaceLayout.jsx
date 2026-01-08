'use client';

import TopBar from '@/components/layout/TopBar';
import Toolbar from '@/components/layout/Toolbar';
import PropertyBar from '@/components/layout/PropertyBar';
import LeftPanel from '@/components/layout/LeftPanel';
import RightPanel from '@/components/layout/RightPanel';
import TimelineBar from '@/components/layout/TimelineBar';
import CanvasStage from '@/components/layout/CanvasStage';
import { SelectionProvider, useSelection } from './SelectionContext';
import { useKeyboardShortcuts } from '@/components/interaction/useKeyboardShortcuts';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';

function WorkspaceLayoutInner({ adapter, events, cursor, setCursorIndex, emit }) {
  const { selectedIds } = useSelection();

  function getState() {
    return getDesignStateAtCursor({
      events,
      uptoIndex: cursor.index,
    });
  }

  useKeyboardShortcuts({
    selectedIds,
    emit,
    undo: () => setCursorIndex((i) => Math.max(-1, i - 1)),
    redo: () =>
      setCursorIndex((i) => Math.min(events.length - 1, i + 1)),
    getState,
  });

  return (
    <div className="workspace-root">
      <TopBar modeLabel={adapter.label} />

      <Toolbar mode={adapter} />

      <PropertyBar events={events} cursor={cursor} />

      <div className="workspace-main">
        <LeftPanel panels={adapter.panels?.left} />

        <CanvasStage adapter={adapter} events={events} cursor={cursor} emit={emit} />

        <RightPanel panels={adapter.panels?.right} />
      </div>

      <TimelineBar events={events} cursor={cursor} setCursorIndex={setCursorIndex} />
    </div>
  );
}

export function WorkspaceLayout({ adapter, events, cursor, setCursorIndex, emit }) {
  return (
    <SelectionProvider>
      <WorkspaceLayoutInner
        adapter={adapter}
        events={events}
        cursor={cursor}
        setCursorIndex={setCursorIndex}
        emit={emit}
      />
    </SelectionProvider>
  );
}
