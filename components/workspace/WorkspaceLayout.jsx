'use client';

import TopBar from '@/components/layout/TopBar';
import Toolbar from '@/components/layout/Toolbar';
import PropertyBar from '@/components/layout/PropertyBar';
import LeftPanel from '@/components/layout/LeftPanel';
import RightPanel from '@/components/layout/RightPanel';
import TimelineBar from '@/components/layout/TimelineBar';
import CanvasStage from '@/components/layout/CanvasStage';
import { EducationToolbar } from '@/education/EducationToolbar';
import { SelectionProvider, useSelection } from './SelectionContext';
import { useKeyboardShortcuts } from '@/components/interaction/useKeyboardShortcuts';
import { getDesignStateAtCursor } from '@/runtime/replay/getDesignStateAtCursor';

function WorkspaceLayoutInner({
  adapter,
  events,
  cursor,
  setCursorIndex,
  emit,
  onOpenTemplateGenerator,
}) {
  const { selectedIds, setSelection } = useSelection();

  function getState() {
    return getDesignStateAtCursor({
      events,
      uptoIndex: cursor.index,
    });
  }

  useKeyboardShortcuts({
    enabled: adapter?.id !== 'education',
    selectedIds,
    setSelection,
    emit,
    undo: () => setCursorIndex((i) => Math.max(-1, i - 1)),
    redo: () => setCursorIndex((i) => Math.min(events.length - 1, i + 1)),
    getState,
  });

  return (
    <div className="workspace-root">
      <TopBar modeLabel={adapter.label} />

      {adapter?.id === 'education' ? (
        <EducationToolbar
          emit={emit}
          cursor={cursor}
          events={events}
          selectedId={
            selectedIds && selectedIds.size === 1
              ? Array.from(selectedIds)[0]
              : null
          }
        />
      ) : (
        <Toolbar mode={adapter} onOpenTemplateGenerator={onOpenTemplateGenerator} />
      )}

      {adapter?.id === 'education' ? null : (
        <PropertyBar events={events} cursor={cursor} />
      )}

      <div className="workspace-main">
        <LeftPanel panels={adapter.panels?.left} />

        <CanvasStage adapter={adapter} events={events} cursor={cursor} emit={emit} />

        <RightPanel
          panels={adapter.panels?.right}
          events={events}
          cursor={cursor}
          emit={emit}
        />
      </div>

      <TimelineBar events={events} cursor={cursor} setCursorIndex={setCursorIndex} />
    </div>
  );
}

export function WorkspaceLayout({
  adapter,
  events,
  cursor,
  setCursorIndex,
  emit,
  onOpenTemplateGenerator,
}) {
  return (
    <SelectionProvider>
      <WorkspaceLayoutInner
        adapter={adapter}
        events={events}
        cursor={cursor}
        setCursorIndex={setCursorIndex}
        emit={emit}
        onOpenTemplateGenerator={onOpenTemplateGenerator}
      />
    </SelectionProvider>
  );
}
