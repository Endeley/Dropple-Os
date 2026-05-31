'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUuid } from '@/core/utils/createUuid.js';
import {
  selectShotTimelineView,
  useWorkspaceProjectionState as useRuntimeStore,
  useWorkspaceVisualState,
} from '@/runtime/projection';
import { useShotEditorIntent } from '@/ui/workspace/editor/shotEditorIntent.js';
import TransitionHandle from '@/ui/timeline/components/TransitionHandle.jsx';
import {
  computeShotDragPreview,
  computeShotResizePreview,
} from '@/runtime/interaction/shotTimelineInteraction.js';

const TRACK_HEIGHT = 32;
const TRACK_WIDTH_PX = 960;
const TRACK_GAP = 8;
const DEFAULT_NEW_SHOT_DURATION_MS = 1000;
const SNAP_GRID_MS = 100;
const SNAP_THRESHOLD_MS = 20;

function actionButtonStyle(disabled = false) {
  return {
    height: 28,
    padding: '0 10px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: disabled ? '#f8fafc' : '#ffffff',
    color: disabled ? '#94a3b8' : '#0f172a',
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

function resolveSeedCompositionId(timelineView, selectedTrack) {
  const selectedTrackShot = selectedTrack?.shots?.find((shot) => Boolean(shot?.compositionId)) ?? null;
  if (selectedTrackShot?.compositionId) return selectedTrackShot.compositionId;

  const activeShot =
    timelineView?.tracks
      ?.flatMap((track) => track.shots)
      .find((shot) => shot?.isActive && shot?.compositionId) ?? null;
  if (activeShot?.compositionId) return activeShot.compositionId;

  const firstShot =
    timelineView?.tracks
      ?.flatMap((track) => track.shots)
      .find((shot) => Boolean(shot?.compositionId)) ?? null;
  return firstShot?.compositionId ?? null;
}

function buildNewShot({ timelineView, selectedTrack }) {
  if (!selectedTrack) return null;

  const lastShot = selectedTrack.shots[selectedTrack.shots.length - 1] ?? null;
  const start = Math.max(0, Math.round(timelineView?.frameTime ?? lastShot?.endMs ?? 0));
  const duration = Math.max(
    1,
    lastShot?.durationMs ?? DEFAULT_NEW_SHOT_DURATION_MS,
  );
  const compositionId = resolveSeedCompositionId(timelineView, selectedTrack);
  if (!compositionId) return null;

  const shotNumber =
    timelineView.tracks.reduce((count, track) => count + track.shots.length, 0) + 1;

  return {
    id: `shot-${createUuid()}`,
    name: `Shot ${shotNumber}`,
    start,
    duration,
    compositionId,
    transitionOut: null,
  };
}

export default function ShotTimelineBar() {
  const timelineView = useWorkspaceVisualState(selectShotTimelineView);
  const shotIntent = useShotEditorIntent();
  const frameTime = useRuntimeStore((state) => state.frameTime) ?? 0;
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const tracks = useMemo(() => timelineView?.tracks ?? [], [timelineView]);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!tracks.some((track) => track.id === selectedTrackId)) {
      setSelectedTrackId(tracks[0]?.id ?? null);
    }
  }, [tracks, selectedTrackId]);

  const trackOptions = useMemo(
    () =>
      tracks.map((track, index) => ({
        id: track.id,
        label: track.name || `Track ${index + 1}`,
      })),
    [tracks],
  );

  if (!tracks.length || !timelineView) return null;

  const pixelsPerMs = TRACK_WIDTH_PX / timelineView.totalDuration;
  const selectedTrack =
    tracks.find((track) => track.id === selectedTrackId) ??
    tracks[0] ??
    null;
  const selectedTrackIndex = selectedTrack
    ? tracks.findIndex((track) => track.id === selectedTrack.id)
    : -1;
  const canCreateShot = Boolean(resolveSeedCompositionId(timelineView, selectedTrack));
  const canMoveTrackUp = selectedTrackIndex > 0;
  const canMoveTrackDown = selectedTrackIndex >= 0 && selectedTrackIndex < tracks.length - 1;

  function handleCreateTrack() {
    const nextOrder =
      tracks.reduce((max, track) => Math.max(max, track.order), -1) + 1;
    const nextTrackId = `track-${createUuid()}`;

    shotIntent.createTrack({
      track: {
        id: nextTrackId,
        name: `Track ${tracks.length + 1}`,
        order: nextOrder,
        kind: 'shot',
      },
    });
    setSelectedTrackId(nextTrackId);
  }

  function handleCreateShot() {
    const shot = buildNewShot({
      timelineView: {
        ...timelineView,
        frameTime,
      },
      selectedTrack,
    });
    if (!shot || !selectedTrack?.id) return;

    shotIntent.create({
      trackId: selectedTrack.id,
      shot,
    });
  }

  function handleRenameTrack() {
    if (typeof window === 'undefined' || !selectedTrack?.id) return;
    const nextName = window.prompt('Track name', selectedTrack.name || '');
    if (nextName == null) return;

    shotIntent.updateTrack({
      trackId: selectedTrack.id,
      patch: {
        name: nextName.trim(),
      },
    });
  }

  function handleReorderTrack(direction) {
    if (!selectedTrack?.id) return;

    const targetIndex = selectedTrackIndex + direction;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;

    const targetTrack = tracks[targetIndex] ?? null;
    if (!targetTrack?.id) return;

    shotIntent.updateTrack({
      trackId: selectedTrack.id,
      patch: {
        order: targetTrack.order,
      },
    });
    shotIntent.updateTrack({
      trackId: targetTrack.id,
      patch: {
        order: selectedTrack.order,
      },
    });
  }

  function handleDeleteTrack() {
    if (typeof window === 'undefined' || !selectedTrack?.id || tracks.length <= 1) return;
    const confirmed = window.confirm(`Delete track "${selectedTrack.name || selectedTrack.id}"?`);
    if (!confirmed) return;

    shotIntent.deleteTrack({
      trackId: selectedTrack.id,
    });
  }

  function commitShotPreview(preview, dragState) {
    if (!preview || !dragState?.shot) return;

    const sourceTrackId = dragState.sourceTrackId;
    const targetTrackId = preview.targetTrackId ?? sourceTrackId;
    const originalShot = dragState.shot;
    shotIntent.move({
      shotId: originalShot.id,
      fromTrackId: sourceTrackId,
      toTrackId: targetTrackId,
      startMs: Math.round(preview.startMs),
      endMs: Math.max(Math.round(preview.startMs), Math.round(preview.endMs)),
    });
    if (targetTrackId) {
      setSelectedTrackId(targetTrackId);
    }
  }

  function startShotPointerInteraction(event, shot, track, mode = 'move') {
    if (typeof window === 'undefined' || !shot?.id || !track?.id || !timelineRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    setSelectedTrackId(track.id);

    const containerRect = timelineRef.current.getBoundingClientRect();
    const startX = event.clientX;

    const dragState = {
      mode,
      startX,
      shot,
      sourceTrackId: track.id,
      containerTopPx: containerRect.top,
    };

    const onPointerMove = (moveEvent) => {
      const deltaMs = (moveEvent.clientX - startX) / pixelsPerMs;
      const preview =
        mode === 'move'
          ? computeShotDragPreview({
              shot,
              tracks,
              sourceTrackId: track.id,
              pointerClientY: moveEvent.clientY,
              containerTopPx: containerRect.top,
              trackHeight: TRACK_HEIGHT,
              trackGap: TRACK_GAP,
              deltaMs,
              playheadMs: frameTime,
              gridSizeMs: SNAP_GRID_MS,
              thresholdMs: SNAP_THRESHOLD_MS,
            })
          : computeShotResizePreview({
              shot,
              tracks,
              sourceTrackId: track.id,
              edge: mode,
              deltaMs,
              playheadMs: frameTime,
              gridSizeMs: SNAP_GRID_MS,
              thresholdMs: SNAP_THRESHOLD_MS,
            });

      const normalizedPreview = {
        ...preview,
        shotId: shot.id,
      };
      setDragPreview(normalizedPreview);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setDragPreview((current) => {
        commitShotPreview(current, dragState);
        return null;
      });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  }

  const previewGuide = dragPreview?.guides?.[0] ?? null;

  return (
    <div
      style={{
        padding: '6px 8px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f8fafc',
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <button type='button' onClick={handleCreateTrack} style={actionButtonStyle(false)}>
          Add Track
        </button>
        <button
          type='button'
          onClick={handleCreateShot}
          disabled={!selectedTrack?.id || !canCreateShot}
          style={actionButtonStyle(!selectedTrack?.id || !canCreateShot)}
        >
          Add Shot
        </button>
        <button
          type='button'
          onClick={handleRenameTrack}
          disabled={!selectedTrack?.id}
          style={actionButtonStyle(!selectedTrack?.id)}
        >
          Rename Track
        </button>
        <button
          type='button'
          onClick={() => handleReorderTrack(-1)}
          disabled={!canMoveTrackUp}
          style={actionButtonStyle(!canMoveTrackUp)}
        >
          Track Up
        </button>
        <button
          type='button'
          onClick={() => handleReorderTrack(1)}
          disabled={!canMoveTrackDown}
          style={actionButtonStyle(!canMoveTrackDown)}
        >
          Track Down
        </button>
        <button
          type='button'
          onClick={handleDeleteTrack}
          disabled={!selectedTrack?.id || tracks.length <= 1}
          style={actionButtonStyle(!selectedTrack?.id || tracks.length <= 1)}
        >
          Delete Track
        </button>
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginLeft: 4,
            flexWrap: 'wrap',
          }}
        >
          {trackOptions.map((track) => {
            const isSelected = track.id === selectedTrack?.id;
            return (
              <button
                key={track.id}
                type='button'
                onClick={() => setSelectedTrackId(track.id)}
                style={{
                  height: 26,
                  padding: '0 10px',
                  borderRadius: 6,
                  border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                  background: isSelected ? 'rgba(37,99,235,0.12)' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#334155',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {track.label}
              </button>
            );
          })}
        </div>
      </div>
      <div
        ref={timelineRef}
        style={{
          position: 'relative',
          width: TRACK_WIDTH_PX,
          minWidth: TRACK_WIDTH_PX,
          height: tracks.length * TRACK_HEIGHT + (tracks.length - 1) * TRACK_GAP,
        }}
      >
      {previewGuide ? (
        <div
          aria-hidden='true'
          style={{
            position: 'absolute',
            left: previewGuide.snapped * pixelsPerMs,
            top: 0,
            width: 1,
            height: tracks.length * TRACK_HEIGHT + (tracks.length - 1) * TRACK_GAP,
            background: 'rgba(37,99,235,0.5)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {tracks.map((track, trackIndex) => {
        const topPx = trackIndex * (TRACK_HEIGHT + TRACK_GAP);
        return (
          <React.Fragment key={track.id}>
            <div
              aria-hidden='true'
              style={{
                position: 'absolute',
                left: 0,
                top: topPx,
                width: TRACK_WIDTH_PX,
                height: TRACK_HEIGHT,
                borderRadius: 6,
                background: track.id === selectedTrack?.id ? '#dbeafe' : '#eef2f7',
              }}
            />
            {track.shots.map((shot, index) => {
              const previewForShot = dragPreview?.shotId === shot.id ? dragPreview : null;
              if (previewForShot && previewForShot.targetTrackId !== track.id) {
                return null;
              }

              const renderedShot = previewForShot
                ? {
                    ...shot,
                    startMs: previewForShot.startMs,
                    endMs: previewForShot.endMs,
                    durationMs: Math.max(1, previewForShot.endMs - previewForShot.startMs),
                  }
                : shot;
              const widthPx = Math.max(48, renderedShot.durationMs * pixelsPerMs);
              const leftPx = renderedShot.startMs * pixelsPerMs;
              const nextShot = track.shots[index + 1] ?? null;
              return (
                <React.Fragment key={shot.id}>
                  <div
                    onClick={() => {
                      if (!shot?.id) return;
                      setSelectedTrackId(track.id);
                      shotIntent.setActive({ shotId: shot.id });
                    }}
                    onPointerDown={(event) => startShotPointerInteraction(event, shot, track, 'move')}
                    style={{
                      position: 'absolute',
                      left: leftPx,
                      top: topPx,
                      width: widthPx,
                      minWidth: 48,
                      height: TRACK_HEIGHT,
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: shot.isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      background: shot.isActive ? 'rgba(37,99,235,0.12)' : '#ffffff',
                      color: shot.isActive ? '#1d4ed8' : '#0f172a',
                      fontSize: 12,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      boxSizing: 'border-box',
                      zIndex: 1,
                    }}
                    title={shot?.name ?? shot?.id}
                  >
                    <button
                      type='button'
                      aria-label={`Resize ${shot?.name ?? shot?.id} start`}
                      onPointerDown={(event) => startShotPointerInteraction(event, shot, track, 'left')}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: 6,
                        height: TRACK_HEIGHT,
                        border: 0,
                        padding: 0,
                        borderRadius: 3,
                        background: 'rgba(15,23,42,0.08)',
                        cursor: 'ew-resize',
                      }}
                    />
                    <button
                      type='button'
                      aria-label={`Resize ${shot?.name ?? shot?.id} end`}
                      onPointerDown={(event) => startShotPointerInteraction(event, shot, track, 'right')}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: 6,
                        height: TRACK_HEIGHT,
                        border: 0,
                        padding: 0,
                        borderRadius: 3,
                        background: 'rgba(15,23,42,0.08)',
                        cursor: 'ew-resize',
                      }}
                    />
                    {shot?.name ?? shot?.id}
                  </div>
                  {nextShot && shot.hasAdjacentNextShot ? (
                    <TransitionHandle
                      fromShot={shot}
                      toShot={nextShot}
                      pixelsPerMs={pixelsPerMs}
                      trackHeight={TRACK_HEIGHT}
                      topPx={topPx}
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
            {dragPreview?.shotId && dragPreview.targetTrackId === track.id && !track.shots.some((shot) => shot.id === dragPreview.shotId) ? (
              <div
                aria-hidden='true'
                style={{
                  position: 'absolute',
                  left: dragPreview.startMs * pixelsPerMs,
                  top: topPx,
                  width: Math.max(48, (dragPreview.endMs - dragPreview.startMs) * pixelsPerMs),
                  height: TRACK_HEIGHT,
                  borderRadius: 6,
                  border: '1px dashed #2563eb',
                  background: 'rgba(37,99,235,0.08)',
                  boxSizing: 'border-box',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}
      </div>
    </div>
  );
}
