'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import CanvasStage from '@/ui/layout/CanvasStage';
import TimelineBar from '@/ui/layout/TimelineBar';
import { SelectionProvider } from '@/ui/workspace/shared/SelectionContext';
import { ModeProvider } from '@/ui/workspace/shared/ModeContext';
import { hydrateLocalDocumentSnapshot } from '@/persistence/localDocumentSchema';
import { useViewerControls } from '@/viewer/useViewerControls';
import { ViewerToolbar } from '@/viewer/ViewerToolbar';
import { ViewerStage } from '@/viewer/ViewerStage';
import { parseViewerParams } from '@/viewer/parseViewerParams';
import { useGalleryIdentity } from '@/gallery/useGalleryIdentity';
import { openServerDocument } from '@/editor/openServerDocument';
import { api } from '@/convex/_generated/api';

export default function ViewerClient({ snapshot, meta }) {
  const [cursorIndex, setCursorIndex] = useState(-1);
  const paramsConfig = parseViewerParams();
  const controls = useViewerControls(paramsConfig);
  const router = useRouter();
  const identity = useGalleryIdentity();
  const isOwner = identity?.id && meta?.ownerId && identity.id === meta.ownerId;
  const trackView = useMutation(api.analytics.trackView);
  const trackFork = useMutation(api.analytics.trackFork);
  const stats = useQuery(
    api.analytics.getGalleryStats,
    isOwner && meta?.id ? { galleryItemId: meta.id } : 'skip'
  );
  const didTrackRef = useRef(false);
  const sessionIdRef = useRef(null);

  function getAnalyticsSessionId() {
    if (typeof window === 'undefined') return null;
    if (sessionIdRef.current) return sessionIdRef.current;

    try {
      let id = sessionStorage.getItem('dropple.analytics.session');
      if (!id) {
        id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `session-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem('dropple.analytics.session', id);
      }
      sessionIdRef.current = id;
      return id;
    } catch {
      return null;
    }
  }

  const hydrated = useMemo(() => {
    if (!snapshot) return null;
    return hydrateLocalDocumentSnapshot(snapshot);
  }, [snapshot]);

  const events = hydrated?.events || [];
  const cursor = {
    index:
      hydrated?.cursorIndex != null
        ? hydrated.cursorIndex
        : Math.min(events.length - 1, cursorIndex),
  };

  const adapter = useMemo(
    () => ({
      id: 'review',
      label: meta?.title ? `Viewer - ${meta.title}` : 'Viewer',
      capabilities: { canvas: true, timeline: true, editing: false },
    }),
    [meta?.title]
  );

  useEffect(() => {
    if (!meta?.id || !meta?.ownerId) return;
    if (didTrackRef.current) return;
    didTrackRef.current = true;
    trackView({
      galleryItemId: meta.id,
      ownerId: meta.ownerId,
      source: 'viewer',
      sessionId: getAnalyticsSessionId(),
    }).catch(() => {});
  }, [meta?.id, meta?.ownerId, trackView]);

  async function handleOpenInEditor() {
    try {
      if (meta?.id && meta?.ownerId) {
        trackFork({
          galleryItemId: meta.id,
          ownerId: meta.ownerId,
        }).catch(() => {});
      }
      const localDocId = openServerDocument(snapshot, {
        name: meta?.title || 'Untitled',
        galleryItemId: meta?.id || null,
        ownerId: meta?.ownerId || null,
      });
      router.push(`/workspace/design?doc=${localDocId}&from=gallery`);
    } catch (err) {
      console.error('[viewer] failed to open in editor', err);
      window.alert('Unable to open in editor.');
    }
  }

  return (
    <SelectionProvider>
      <ModeProvider value="viewer">
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            {paramsConfig.controls && <ViewerToolbar {...controls} />}
            {isOwner && (
              <div
                style={{
                  position: 'absolute',
                  top: 52,
                  right: 8,
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {stats && (
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    👁 {stats.views} · Forked {stats.forks}
                  </div>
                )}
                <button
                  onClick={handleOpenInEditor}
                  style={{
                    padding: '6px 10px',
                    fontSize: 13,
                    borderRadius: 6,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Open in editor
                </button>
              </div>
            )}
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
          {paramsConfig.timeline && (
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
