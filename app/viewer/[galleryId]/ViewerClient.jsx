'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { WorkspaceCanvasRoot } from '@/ui/workspace/WorkspaceCanvasRoot.jsx';
import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';
import { GridProvider } from '@/ui/workspace/shared/GridContext';
import { ModeProvider } from '@/ui/workspace/shared/ModeContext';
import { hydrateLocalDocumentSnapshot } from '@/infrastructure/persistence/localDocumentSchema.js';
import { useViewerControls } from '@/viewer/useViewerControls';
import { ViewerTimelineBar } from '@/viewer/ViewerTimelineBar.jsx';
import { ViewerToolbar } from '@/viewer/ViewerToolbar';
import { ViewerStage } from '@/viewer/ViewerStage';
import { parseViewerParams } from '@/viewer/parseViewerParams';
import { useGalleryIdentity } from '@/gallery/useGalleryIdentity';
import { isEnvironmentArtifact } from '@/gallery/artifacts/types.js';
import { openServerDocument } from '@/editor/openServerDocument';
import { api } from '@/convex/_generated/api';
import { getExportCapabilities } from '@/runtime/export/getExportCapabilities.js';
import {
  ArtifactExportKinds,
  exportArtifact as exportArtifactFacade,
} from '@/runtime/export/exportArtifact.js';
import { verifyExportArtifact } from '@/runtime/export/verify/verifyExportArtifact.js';
import { resolveViewerRuntimeCamera } from '@/viewer/runtimeCameraDiagnostics.js';
import ViewerEnvironmentBridge from './ViewerEnvironmentBridge.jsx';

const DEFAULT_VIEWER_PARAMS = {
  zoom: 1,
  bg: 'light',
  timeline: true,
  controls: true,
};

function EnvironmentViewerCanvas({ workspaceId, resolvedEnvironment }) {
  return (
    <WorkspaceRoot
      workspaceId={workspaceId}
      branchId='viewer'
      profile='design'
      modeId='review'
    >
      <ViewerEnvironmentBridge resolvedEnvironment={resolvedEnvironment} />
      <WorkspaceCanvasRoot
        workspaceId={workspaceId}
        readOnly
        runtimeReadOnly
      />
    </WorkspaceRoot>
  );
}

export default function ViewerClient({
  artifact,
  meta,
}) {
  const [cursorIndex, setCursorIndex] = useState(-1);
  const [paramsConfig, setParamsConfig] = useState(DEFAULT_VIEWER_PARAMS);
  const [verificationState, setVerificationState] = useState(null);
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
  const hasResolvedEnvironment = isEnvironmentArtifact(artifact);
  const exportCapabilities = useMemo(
    () => getExportCapabilities(artifact),
    [artifact]
  );
  const snapshot = artifact?.snapshot ?? null;
  const resolvedEnvironment = hasResolvedEnvironment
    ? artifact.resolvedEnvironment
    : null;
  const runtimeCamera = useMemo(() => {
    try {
      return resolveViewerRuntimeCamera(artifact);
    } catch {
      return null;
    }
  }, [artifact]);

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
    if (hasResolvedEnvironment) return null;
    if (!snapshot) return null;
    return hydrateLocalDocumentSnapshot(snapshot);
  }, [hasResolvedEnvironment, snapshot]);

  useEffect(() => {
    const nextEvents = hydrated?.events || [];
    const maxIndex = nextEvents.length - 1;
    const nextCursorIndex = Math.max(-1, Math.min(maxIndex, hydrated?.cursorIndex ?? -1));
    setCursorIndex(nextCursorIndex);
  }, [hydrated]);

  useEffect(() => {
    setParamsConfig(parseViewerParams());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function verifyArtifact() {
      try {
        const exported = await exportArtifactFacade({
          artifact,
          format: ArtifactExportKinds.DROPPLE_SPEC,
          options: {
            download: false,
          },
        });
        const verification = await verifyExportArtifact({
          artifact,
          format: exported.format,
          output: exported.output,
          exportHash: exported.exportHash,
          canonicalVersion: exported.canonicalVersion,
          algorithm: exported.algorithm,
          options: {
            download: false,
          },
        });

        if (!cancelled) {
          setVerificationState(verification);
        }
      } catch (nextError) {
        if (!cancelled) {
          setVerificationState({
            valid: false,
            error: nextError?.message ?? 'Verification failed.',
          });
        }
      }
    }

    setVerificationState(null);
    verifyArtifact();

    return () => {
      cancelled = true;
    };
  }, [artifact]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    window.__DROPPLE_VIEWER_MODE__ = hasResolvedEnvironment
      ? 'environment'
      : 'snapshot';
    window.__DROPPLE_VIEWER_ARTIFACT_KIND__ = artifact?.kind ?? null;
    window.__DROPPLE_VIEWER_CAMERA__ = runtimeCamera ?? null;
    window.__DROPPLE_VIEWER_CAMERA_TRANSITION__ = runtimeCamera?.transition ?? null;

    return () => {
      delete window.__DROPPLE_VIEWER_MODE__;
      delete window.__DROPPLE_VIEWER_ARTIFACT_KIND__;
      delete window.__DROPPLE_VIEWER_CAMERA__;
      delete window.__DROPPLE_VIEWER_CAMERA_TRANSITION__;
    };
  }, [artifact?.kind, hasResolvedEnvironment, runtimeCamera]);

  const events = hydrated?.events || [];
  const maxCursorIndex = events.length - 1;
  const cursor = {
    index: Math.max(-1, Math.min(maxCursorIndex, cursorIndex)),
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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GridProvider>
        <ModeProvider value="viewer">
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              {paramsConfig.controls && <ViewerToolbar {...controls} />}
              <div
                style={{
                  position: 'absolute',
                  top: 52,
                  left: 8,
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  maxWidth: 280,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(148, 163, 184, 0.24)',
                  background: 'rgba(255, 255, 255, 0.92)',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                  }}
                >
                  {exportCapabilities.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: '#475569',
                  }}
                >
                  {exportCapabilities.description}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                  }}
                >
                  {exportCapabilities.formats.map((format) => (
                    <span
                      key={format}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: '1px solid rgba(148, 163, 184, 0.28)',
                        background: 'rgba(248, 250, 252, 0.95)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#334155',
                      }}
                    >
                      {format.toUpperCase()}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: exportCapabilities.reproducible ? '#0f766e' : '#b45309',
                  }}
                >
                  {exportCapabilities.reproducible ? 'Reproducible' : 'Non-reproducible'}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(148, 163, 184, 0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: verificationState?.valid ? '#0f766e' : '#475569',
                    }}
                  >
                    {verificationState == null
                      ? 'Verifying deterministic artifact...'
                      : verificationState.valid
                        ? 'Verified deterministic artifact'
                        : 'Verification unavailable'}
                  </div>
                  {verificationState?.exportHash ? (
                    <>
                      <div style={{ fontSize: 11, color: '#475569' }}>
                        Fingerprint: {verificationState.exportHash.slice(0, 16)}...
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {verificationState.canonicalVersion} · {verificationState.algorithm}
                      </div>
                    </>
                  ) : null}
                  {verificationState?.error ? (
                    <div style={{ fontSize: 11, color: '#b45309' }}>
                      {verificationState.error}
                    </div>
                  ) : null}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(148, 163, 184, 0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                  data-testid="viewer-camera-diagnostics"
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    Runtime Camera
                  </div>
                  {runtimeCamera ? (
                    <>
                      <div style={{ fontSize: 11, color: '#475569' }}>
                        {runtimeCamera.source} · {runtimeCamera.resolvedFrom}
                      </div>
                      {runtimeCamera.transition?.active ? (
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          Transition {Math.round((runtimeCamera.transition.progress ?? 0) * 100)}% ·{' '}
                          {runtimeCamera.transition.fromShotId} → {runtimeCamera.transition.toShotId}
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          Single-owner authority
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        x {runtimeCamera.transform?.x ?? 0} · y {runtimeCamera.transform?.y ?? 0} · zoom{' '}
                        {runtimeCamera.transform?.zoom ?? 1} · rot {runtimeCamera.transform?.rotation ?? 0}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      Runtime camera unavailable
                    </div>
                  )}
                </div>
              </div>
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
                {hasResolvedEnvironment ? (
                  <EnvironmentViewerCanvas
                    workspaceId={adapter.id}
                    resolvedEnvironment={resolvedEnvironment}
                  />
                ) : (
                  <WorkspaceCanvasRoot
                    workspaceId={adapter.id}
                    events={events}
                    cursor={cursor}
                    readOnly
                  />
                )}
              </ViewerStage>
            </div>
            {paramsConfig.timeline && !hasResolvedEnvironment && (
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
