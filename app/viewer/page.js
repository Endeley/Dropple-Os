'use client';

import { useEffect, useMemo, useState } from 'react';
import { WorkspaceCanvasRoot } from '@/ui/workspace/WorkspaceCanvasRoot.jsx';
import { GridProvider } from '@/ui/workspace/shared/GridContext';
import { ModeProvider } from '@/ui/workspace/shared/ModeContext';
import { hydrateLocalDocumentSnapshot } from '@/infrastructure/persistence/localDocumentSchema.js';
import { useViewerControls } from '@/viewer/useViewerControls';
import { ViewerTimelineBar } from '@/viewer/ViewerTimelineBar.jsx';
import { ViewerToolbar } from '@/viewer/ViewerToolbar';
import { ViewerStage } from '@/viewer/ViewerStage';
import { parseViewerParams } from '@/viewer/parseViewerParams';

const DEFAULT_VIEWER_PARAMS = {
  zoom: 1,
  bg: 'light',
  timeline: true,
  controls: true,
};

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
  const [snapshot, setSnapshot] = useState(null);
  const [params, setParams] = useState(DEFAULT_VIEWER_PARAMS);
  const [cursorIndex, setCursorIndex] = useState(-1);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const [payload] = hash.split('?');
    const nextSnapshot = decodeSnapshot(payload);
    const nextEvents = nextSnapshot?.events || [];
    const maxIndex = nextEvents.length - 1;

    setSnapshot(nextSnapshot);
    setCursorIndex(Math.max(-1, Math.min(maxIndex, nextSnapshot?.cursorIndex ?? -1)));
    setParams(parseViewerParams());
  }, []);

  const controls = useViewerControls(params);
  const events = snapshot?.events || [];
  const maxCursorIndex = events.length - 1;

  const adapter = useMemo(
    () => ({
      id: 'review',
      label: 'Viewer',
      capabilities: { canvas: true, timeline: true, editing: false },
    }),
    []
  );

  const cursor = {
    index: Math.max(-1, Math.min(maxCursorIndex, cursorIndex)),
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GridProvider>
        <ModeProvider value="viewer">
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              {params.controls && <ViewerToolbar {...controls} />}
              <ViewerStage zoom={controls.zoom} bg={controls.bg}>
                <WorkspaceCanvasRoot
                  workspaceId={adapter.id}
                  events={events}
                  cursor={cursor}
                  readOnly
                />
              </ViewerStage>
            </div>
            {params.timeline && (
              <ViewerTimelineBar
                events={events}
                cursorIndex={cursor.index}
                onSeek={(nextCursorIndex) => {
                  setCursorIndex(Math.max(-1, Math.min(maxCursorIndex, nextCursorIndex)));
                }}
              />
            )}
          </div>
        </ModeProvider>
      </GridProvider>
    </div>
  );
}
