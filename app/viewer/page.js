'use client';

import { useMemo, useState } from 'react';
import CanvasStage from '@/ui/layout/CanvasStage';
import TimelineBar from '@/ui/layout/TimelineBar';
import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';
import { GridProvider } from '@/ui/workspace/shared/GridContext';
import { ModeProvider } from '@/ui/workspace/shared/ModeContext';
import { hydrateLocalDocumentSnapshot } from '@/infrastructure/persistence/localDocumentSchema.js';
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
  const initialSnapshot = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash.slice(1);
    const [payload] = hash.split('?');
    return decodeSnapshot(payload);
  }, []);
  const [events] = useState(() => initialSnapshot?.events || []);
  const [cursorIndex, setCursorIndex] = useState(() => {
    const list = initialSnapshot?.events || [];
    const maxIndex = list.length - 1;
    return Math.max(-1, Math.min(maxIndex, initialSnapshot?.cursorIndex ?? -1));
  });
  const params = parseViewerParams();
  const controls = useViewerControls(params);

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
    <WorkspaceRoot profile="design">
      <GridProvider>
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
      </GridProvider>
    </WorkspaceRoot>
  );
}
