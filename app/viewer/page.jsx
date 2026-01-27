'use client';

import { useEffect, useMemo, useState } from 'react';
import CanvasStage from '@/ui/layout/CanvasStage';
import TimelineBar from '@/ui/layout/TimelineBar';
import { SelectionProvider } from '@/ui/workspace/shared/SelectionContext';
import { ModeProvider } from '@/ui/workspace/shared/ModeContext';
import { hydrateLocalDocumentSnapshot } from '@/persistence/localDocumentSchema';
import { useViewerControls } from '@/viewer/useViewerControls';
import { ViewerToolbar } from '@/viewer/ViewerToolbar';
import { ViewerStage } from '@/viewer/ViewerStage';
import { parseViewerParams } from '@/viewer/parseViewerParams';

function decodeSnapshot(payload) {
  if (!payload) return null;
  try {
    const json = decodeURIComponent(atob(payload));
    const snapshot = JSON.parse(json);
    return hydrateLocalDocumentSnapshot(snapshot);
  } catch (err) {
    console.warn('[viewer] invalid share link', err);
    return null;
  }
}

export default function ViewerPage() {
  const [events, setEvents] = useState([]);
  const [cursorIndex, setCursorIndex] = useState(-1);
  const params = parseViewerParams();
  const controls = useViewerControls(params);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const [payload] = hash.split('?');
    const snapshot = decodeSnapshot(payload);
    if (!snapshot) return;
    setEvents(snapshot.events || []);
    const maxIndex = (snapshot.events || []).length - 1;
    const nextCursor = Math.max(-1, Math.min(maxIndex, snapshot.cursorIndex ?? -1));
    setCursorIndex(nextCursor);
  }, []);

  const adapter = useMemo(
    () => ({
      id: 'review',
      label: 'Viewer',
      capabilities: { canvas: true, timeline: true, editing: false },
    }),
    []
  );

  const cursor = { index: cursorIndex };

  return (
    <SelectionProvider>
      <ModeProvider value="viewer">
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            {params.controls && <ViewerToolbar {...controls} />}
            <ViewerStage zoom={controls.zoom} bg={controls.bg}>
              <CanvasStage
                adapter={adapter}
                events={events}
                cursor={cursor}
                emit={() => {}}
                educationReadOnly
                canImport={false}
              />
            </ViewerStage>
          </div>
          {params.timeline && (
            <TimelineBar
              events={events}
              cursor={cursor}
              setCursorIndex={setCursorIndex}
            />
          )}
        </div>
      </ModeProvider>
    </SelectionProvider>
  );
}
