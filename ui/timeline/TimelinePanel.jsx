'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { selectIsReplaying, useWorkspaceProjection } from '@/runtime/projection';
import { runAnimationPreview } from '@/runtime/animation/runAnimationPreview.js';
import { cancelAnimationPreview } from '@/runtime/animation/cancelAnimationPreview.js';
import TimelineScrubber from './TimelineScrubber.jsx';
import TimelinePlayhead from './TimelinePlayhead.jsx';
import TimelineTrackList from './TimelineTrackList.jsx';
import TimelineTimeScale from './TimelineTimeScale.jsx';
import ShotTimelineBar from './ShotTimelineBar.jsx';
import { ShotHUD } from './ShotHUD.jsx';
import { useTimelineController } from './useTimelineController.js';
import { useSelection } from '@/ui/workspace/shared/SelectionContext.jsx';
import { canvasBus } from '../eventBus/canvasBus.js';
import { useTimelineStore } from '@/runtime/stores/useTimelineStore.js';
import { collectKeyframeTimes, getNearestKeyframeTime, getNextKeyframeTime, getPrevKeyframeTime } from '@/runtime/timeline/keyframeTimeUtils.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
  timelineIntentClockPause,
  timelineIntentClockPlay,
  timelineIntentClockSeek,
} from '@/ui/timeline/timelineIntent.js';
import { TrackActions } from '@/runtime/timeline/trackControllerBridge.js';

export default function TimelinePanel({ designState }) {
  const workspaceId = useWorkspaceProjection((s) => s.id);
  const isAnimationWorkspace = workspaceId === 'animation';
  const sceneGraph = useRuntimeStore((s) => s.sceneGraph);
  const runtimeScene = useRuntimeStore((s) => s.scene);
  const frameTime = useRuntimeStore((s) => s.frameTime) ?? 0;
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [rangeInMs, setRangeInMs] = useState(0);
  const [rangeOutMs, setRangeOutMs] = useState(0);
  const [draggingId, setDraggingId] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [dragChannelId, setDragChannelId] = useState(null);
  const [dragChannelSourceTrackId, setDragChannelSourceTrackId] = useState(null);
  const [hoverTrackId, setHoverTrackId] = useState(null);
  const [hoverGroupId, setHoverGroupId] = useState(null);
  const cancelRef = useRef(null);
  const { selectedIds } = useSelection() || {};
  const snapToKeyframes = useTimelineStore((s) => s.snapToKeyframes);
  const previewInterpolation = useTimelineStore((s) => s.previewInterpolation);
  const setSnapToKeyframes = useTimelineStore((s) => s.setSnapToKeyframes);
  const setPreviewInterpolation = useTimelineStore((s) => s.setPreviewInterpolation);
  const setDuration = useTimelineStore((s) => s.setDuration);
  const setKeyframeTimes = useTimelineStore((s) => s.setKeyframeTimes);
  const setIsPlayingFlag = useTimelineStore((s) => s.setIsPlaying);
  const pausePlayback = useCallback(() => {
    timelineIntentClockPause();
    setIsPlayingFlag?.(false);
  }, [setIsPlayingFlag]);
  const timelineSource = useMemo(
    () =>
      designState?.timeline?.timelines?.default ??
      designState?.timeline ??
      { duration: 0, tracks: [], channels: [] },
    [designState]
  );
  const {
    projection,
    dispatch,
    undo,
    redo,
    checkout,
    setSnapshotLabel,
    canUndo,
    canRedo,
    snapshots,
    currentSnapshotId,
  } = useTimelineController(timelineSource);
  const selectedId = selectedIds?.size === 1 ? Array.from(selectedIds)[0] : null;
  const selectedNode = useMemo(
    () => (selectedId ? designState?.nodes?.[selectedId] : null),
    [designState, selectedId]
  );
  const selectedX = selectedNode?.layout?.x;
  const canSetKeyframe = Boolean(selectedId && Number.isFinite(selectedX));

  const isReplaying = selectIsReplaying();
  const shotTimeline = useMemo(() => {
    if (!isAnimationWorkspace) return null;
    if (!sceneGraph || !runtimeScene) return null;
    const activeScene = sceneGraph.scenes?.find((scene) => scene.id === runtimeScene.activeSceneId);
    const activeShot = activeScene?.shots?.find((shot) => shot.id === runtimeScene.activeShotId);
    return activeShot?.timeline ?? null;
  }, [isAnimationWorkspace, sceneGraph, runtimeScene]);

  const animations = isAnimationWorkspace
    ? shotTimeline
    : designState?.timeline?.animations;
  const durationMs = animations?.clips
    ? Object.values(animations.clips).reduce(
        (max, clip) => Math.max(max, clip?.durationMs || 0),
        0
      )
    : 0;

  useEffect(() => {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      setDuration?.(0);
      setKeyframeTimes?.([]);
      return;
    }
    setDuration?.(durationMs);
    setKeyframeTimes?.(collectKeyframeTimes(animations));
  }, [durationMs, setDuration, setKeyframeTimes, animations]);

  useEffect(() => {
    return () => {
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      pausePlayback();
      cancelAnimationPreview();
    };
  }, [pausePlayback]);

  useEffect(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    pausePlayback();
  }, [designState, pausePlayback]);

  const canRenderTimeline = !isReplaying && Boolean(animations?.clips);

  const resolvePreviewTime = useCallback((timeMs) => {
    if (previewInterpolation === 'hold') {
      const times = useTimelineStore.getState().keyframeTimes || [];
      return getPrevKeyframeTime(times, timeMs) ?? timeMs;
    }
    return timeMs;
  }, [previewInterpolation]);

  function clampToRange(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  const hasValidDuration = Number.isFinite(durationMs) && durationMs > 0;
  const safeDurationMs = hasValidDuration ? durationMs : 0;
  const normalizedRangeInMs = hasValidDuration
    ? clampToRange(rangeInMs, 0, durationMs)
    : 0;
  const normalizedRangeOutMs = hasValidDuration
    ? clampToRange(rangeOutMs > 0 ? rangeOutMs : durationMs, 0, durationMs)
    : 0;

  const resolveSnappedTime = useCallback((timeMs, { forceSnap = false } = {}) => {
    const store = useTimelineStore.getState();
    const duration = Number.isFinite(store.duration) ? store.duration : 0;
    const frameMs = 1000 / (store.fps || 24);
    let next = Math.max(0, timeMs);

    if (duration > 0) {
      next = Math.min(next, duration);
    }

    if (store.snapToKeyframes && (store.isScrubbing || forceSnap)) {
      const threshold = frameMs / 2;
      const snapped = getNearestKeyframeTime(store.keyframeTimes, next, threshold);
      if (Number.isFinite(snapped)) {
        next = snapped;
      }
    }

    return next;
  }, []);

  const seekTime = useCallback((timeMs, options = {}) => {
    const next = resolveSnappedTime(timeMs, options);
    timelineIntentClockSeek({ time: next });
    return next;
  }, [resolveSnappedTime]);

  const handleScrub = useCallback((timeMs) => {
    if (isPlaying) {
      pausePlayback();
    }
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }

    const snappedTime = seekTime(timeMs, { forceSnap: true });
    const previewTime = resolvePreviewTime(snappedTime);

    const preview = runAnimationPreview({
      designState,
      timeline: animations,
      timeMs: previewTime,
    });

    cancelRef.current = preview?.cancel || null;
  }, [isPlaying, pausePlayback, seekTime, resolvePreviewTime, designState, animations]);

  function buildPlaybackAnimations(animationsSource, rangeIn, rangeOut, speed) {
    if (!animationsSource) return null;
    const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
    const scale = 1 / safeSpeed;

    const clips = {};
    const tracks = {};
    const keyframes = {};

    Object.values(animationsSource.clips || {}).forEach((clip) => {
      clips[clip.id] = {
        ...clip,
        durationMs: Math.max(0, (rangeOut - rangeIn) * scale),
      };
    });

    Object.values(animationsSource.tracks || {}).forEach((track) => {
      const nextIds = [];
      (track.keyframeIds || []).forEach((id) => {
        const kf = animationsSource.keyframes?.[id];
        if (!kf || !Number.isFinite(kf.timeMs)) return;
        if (kf.timeMs < rangeIn || kf.timeMs > rangeOut) return;
        const shiftedTime = (kf.timeMs - rangeIn) * scale;
        keyframes[id] = {
          ...kf,
          timeMs: shiftedTime,
        };
        nextIds.push(id);
      });

      tracks[track.id] = {
        ...track,
        keyframeIds: nextIds,
      };
    });

    return {
      clips,
      tracks,
      keyframes,
    };
  }

  function startPlayback() {
    if (!animations?.clips) return;
    timelineIntentClockPlay();
    setIsPlayingFlag?.(true);
  }

  function handleResetToIn() {
    const min = 0;
    const max = durationMs;
    const inMs = clampToRange(normalizedRangeInMs, min, max);
    handleScrub(inMs);
  }

  const handleStepFrame = useCallback((direction) => {
    const store = useTimelineStore.getState();
    const frameMs = 1000 / (store.fps || 24);
    const delta = direction > 0 ? frameMs : -frameMs;
    const nextTime = frameTime + delta;
    handleScrub(nextTime);
  }, [frameTime, handleScrub]);

  const handleStepKeyframe = useCallback((direction) => {
    const store = useTimelineStore.getState();
    const next = direction > 0
      ? getNextKeyframeTime(store.keyframeTimes, frameTime)
      : getPrevKeyframeTime(store.keyframeTimes, frameTime);
    if (Number.isFinite(next)) {
      handleScrub(next);
    }
  }, [frameTime, handleScrub]);

  useEffect(() => {
    if (!canRenderTimeline) return undefined;
    function isTypingTarget(target) {
      if (!target) return false;
      const tag = target.tagName?.toLowerCase();
      return tag === 'input' || tag === 'textarea' || target.isContentEditable;
    }

    function handleKeyDown(e) {
      if (isTypingTarget(e.target)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepFrame(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepFrame(1);
      } else if (e.key === ',') {
        e.preventDefault();
        handleStepKeyframe(-1);
      } else if (e.key === '.') {
        e.preventDefault();
        handleStepKeyframe(1);
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setPreviewInterpolation?.(previewInterpolation === 'hold' ? 'interpolate' : 'hold');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewInterpolation, canRenderTimeline, handleStepFrame, handleStepKeyframe, setPreviewInterpolation]);

  function handleSetKeyframe() {
    if (isAnimationWorkspace) return;
    if (!canSetKeyframe) return;

    canvasBus.emit('intent.animation.keyframe.create', {
      nodeId: selectedId,
      property: 'layout.x',
      timeMs: frameTime,
      value: selectedX,
      source: 'timeline.set-keyframe',
    });
  }

  if (!canRenderTimeline) return null;

  return (
    <div
      style={{
        borderTop: '1px solid #e5e7eb',
        background: '#fafafa',
        padding: 8,
      }}
    >
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          background: '#ffffff',
          padding: 8,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
            Snapshots
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: snapshot.id === currentSnapshotId ? '#e2e8f0' : '#ffffff',
                  fontSize: 11,
                }}
              >
                <button
                  type="button"
                  onClick={() => checkout(snapshot.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    fontSize: 11,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#0f172a',
                  }}
                >
                  {snapshot.label || snapshot.shortId}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    key={`${snapshot.id}:${snapshot.label}`}
                    type="text"
                    defaultValue={snapshot.label}
                    onBlur={(event) => {
                      setSnapshotLabel(snapshot.id, event.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.currentTarget.blur();
                      }
                    }}
                    placeholder={snapshot.shortId}
                    style={{
                      fontSize: 10,
                      padding: '2px 4px',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      width: 120,
                    }}
                  />
                  <span style={{ color: '#64748b' }}>
                    p:{snapshot.parentCount} c:{snapshot.childCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
            Tracks
          </div>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: TrackActions.ADD_TRACK,
                payload: { id: `track_${projection.trackCount + 1}`, type: 'standard' },
              })}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Add Track
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 11,
              cursor: canUndo ? 'pointer' : 'not-allowed',
              opacity: canUndo ? 1 : 0.5,
            }}
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 11,
              cursor: canRedo ? 'pointer' : 'not-allowed',
              opacity: canRedo ? 1 : 0.5,
            }}
          >
            Redo
          </button>
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px dashed #cbd5f5',
              background: '#f8fafc',
              fontSize: 12,
            }}
          >
            <span>Groups: {projection.groupCount ?? 0}</span>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: TrackActions.ADD_GROUP,
                  payload: { id: `group_${(projection.groupCount ?? 0) + 1}` },
                })}
              style={{
                padding: '2px 6px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Add Group
            </button>
          </div>
          {projection.groups?.map((group) => (
            <div
              key={group.id}
              onDragOver={(event) => {
                if (!draggingId) return;
                event.preventDefault();
                if (hoverGroupId !== group.id) {
                  setHoverGroupId(group.id);
                }
              }}
              onDragLeave={() => {
                if (hoverGroupId === group.id) {
                  setHoverGroupId(null);
                }
              }}
              onDrop={(event) => {
                if (!draggingId) return;
                event.preventDefault();
                dispatch({
                  type: TrackActions.ASSIGN_TRACK_TO_GROUP,
                  payload: { groupId: group.id, trackId: draggingId },
                });
                setHoverGroupId(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 12,
                background: hoverGroupId === group.id ? '#e2e8f0' : '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>
                  {group.meta?.collapsed ? '▸' : '▾'} {group.id} · {group.trackCount} tracks
                </span>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: TrackActions.TOGGLE_GROUP_COLLAPSE,
                      payload: { id: group.id },
                    })}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {group.meta?.collapsed ? 'Expand' : 'Collapse'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: TrackActions.TOGGLE_GROUP_LOCK,
                      payload: { id: group.id },
                    })}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {group.meta?.locked ? '🔒' : '🔓'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: TrackActions.REMOVE_GROUP,
                      payload: { id: group.id },
                    })}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {projection.tracks.map((track) => {
            const groupId = projection.groupMap?.get(track.id) ?? null;
            const group = projection.groups?.find((g) => g.id === groupId) ?? null;
            if (group?.meta?.collapsed) {
              return null;
            }
            return (
            <div
              key={track.id}
              draggable
              onDragStart={() => {
                setDraggingId(track.id);
                setHoverIndex(track.index);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (dragChannelId) {
                  if (hoverTrackId !== track.id) {
                    setHoverTrackId(track.id);
                  }
                  return;
                }
                if (hoverIndex !== track.index) {
                  setHoverIndex(track.index);
                }
              }}
              onDragLeave={() => {
                if (hoverTrackId === track.id) {
                  setHoverTrackId(null);
                }
                if (hoverIndex === track.index) {
                  setHoverIndex(null);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragChannelId && hoverTrackId) {
                  if (dragChannelSourceTrackId !== hoverTrackId) {
                    dispatch({
                      type: TrackActions.ASSIGN_CHANNEL,
                      payload: {
                        trackId: hoverTrackId,
                        channelId: dragChannelId,
                      },
                    });
                  }
                } else {
                  const targetIndex = track.index;
                  if (draggingId != null && hoverIndex != null && hoverIndex !== targetIndex) {
                    dispatch({
                      type: TrackActions.REORDER_TRACK,
                      payload: { id: draggingId, toIndex: targetIndex },
                    });
                  }
                }
                setDraggingId(null);
                setHoverIndex(null);
                setDragChannelId(null);
                setDragChannelSourceTrackId(null);
                setHoverTrackId(null);
                setHoverGroupId(null);
              }}
              onDragEnd={() => {
                setDraggingId(null);
                setHoverIndex(null);
                setDragChannelId(null);
                setDragChannelSourceTrackId(null);
                setHoverTrackId(null);
                setHoverGroupId(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 12,
                color: '#0f172a',
                background:
                  hoverTrackId === track.id || hoverIndex === track.index ? '#e2e8f0' : '#f8fafc',
                opacity: draggingId === track.id ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'grid', gap: 4 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>
                    #{track.index} · {track.id} · {track.type} · {track.channelCount} channels
                  </span>
                  <span
                    className="track-blend-indicator"
                    style={{ fontSize: 12, color: '#64748b' }}
                  >
                    {track.meta?.blendMode === 'replace' ? '↺' : '+'}
                  </span>
                  {groupId && (
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      in {groupId}
                    </span>
                  )}
                </div>
                {track.channels.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {track.channels.map((channelId) => (
                      <button
                        key={channelId}
                        type="button"
                        draggable
                        onDragStart={(event) => {
                          event.stopPropagation();
                          event.dataTransfer?.setData('text/plain', channelId);
                          setDragChannelId(channelId);
                          setDragChannelSourceTrackId(track.id);
                          setHoverTrackId(track.id);
                        }}
                        onDragEnd={(event) => {
                          event.stopPropagation();
                          setDragChannelId(null);
                          setDragChannelSourceTrackId(null);
                          setHoverTrackId(null);
                        }}
                        style={{
                          border: '1px solid #cbd5f5',
                          borderRadius: 999,
                          padding: '2px 8px',
                          fontSize: 11,
                          background: dragChannelId === channelId ? '#c7d2fe' : '#eef2ff',
                          cursor: 'grab',
                        }}
                      >
                        {channelId}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {groupId && (
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: TrackActions.UNASSIGN_TRACK_FROM_GROUP,
                        payload: { groupId, trackId: track.id },
                      })}
                    style={{
                      padding: '2px 6px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Ungroup
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: TrackActions.TOGGLE_TRACK_LOCK,
                      payload: { id: track.id },
                    })}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {track.meta?.locked ? '🔒' : '🔓'}
                </button>
                <select
                  value={track.meta?.blendMode ?? 'add'}
                  disabled={track.meta?.locked || track.type === 'overlay'}
                  onChange={(event) => {
                    const next = event.target.value;
                    dispatch({
                      type: TrackActions.SET_TRACK_BLEND_MODE,
                      payload: { id: track.id, blendMode: next },
                    });
                  }}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: 11,
                    cursor:
                      track.meta?.locked || track.type === 'overlay' ? 'not-allowed' : 'pointer',
                    opacity: track.meta?.locked || track.type === 'overlay' ? 0.6 : 1,
                  }}
                >
                  <option value="add">Add</option>
                  <option value="replace">Replace</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: TrackActions.REORDER_TRACK,
                      payload: { id: track.id, toIndex: Math.max(0, track.index - 1) },
                    })}
                  disabled={track.index === 0}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: 11,
                    cursor: track.index === 0 ? 'not-allowed' : 'pointer',
                    opacity: track.index === 0 ? 0.5 : 1,
                  }}
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: TrackActions.REORDER_TRACK,
                      payload: { id: track.id, toIndex: track.index + 1 },
                    })}
                  disabled={track.index === projection.trackCount - 1}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: 11,
                    cursor:
                      track.index === projection.trackCount - 1
                        ? 'not-allowed'
                        : 'pointer',
                    opacity: track.index === projection.trackCount - 1 ? 0.5 : 1,
                  }}
                >
                  Down
                </button>
              </div>
            </div>
          );
          })}
        </div>
      </div>
      {isAnimationWorkspace && <ShotTimelineBar />}
      <div style={{ marginBottom: 8 }}>
        <ShotHUD />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleSetKeyframe}
          disabled={!canSetKeyframe}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: canSetKeyframe ? '#ffffff' : '#f1f5f9',
            color: '#0f172a',
            fontSize: 12,
            cursor: canSetKeyframe ? 'pointer' : 'not-allowed',
          }}
        >
          Set Keyframe
        </button>
        <button
          type="button"
          onClick={() => handleStepKeyframe(-1)}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ⏪
        </button>
        <button
          type="button"
          onClick={() => handleStepFrame(-1)}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ⏮
        </button>
        <button
          type="button"
          onClick={() => (isPlaying ? pausePlayback() : startPlayback())}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={() => handleStepFrame(1)}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ⏭
        </button>
        <button
          type="button"
          onClick={() => handleStepKeyframe(1)}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ⏩
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={isLooping}
            onChange={(e) => setIsLooping(e.target.checked)}
          />
          Loop
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={snapToKeyframes}
            onChange={(e) => setSnapToKeyframes?.(e.target.checked)}
          />
          Snap
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={previewInterpolation === 'hold'}
            onChange={(e) => setPreviewInterpolation?.(e.target.checked ? 'hold' : 'interpolate')}
          />
          Hold
        </label>
        <button
          type="button"
          onClick={handleResetToIn}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Reset to In
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          Speed
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            style={{
              padding: '4px 6px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 12,
            }}
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          In
          <input
            type="number"
            min={0}
            max={safeDurationMs}
            value={normalizedRangeInMs}
            onChange={(e) => {
              const next = clampToRange(Number(e.target.value), 0, safeDurationMs);
              setRangeInMs(next);
              if (normalizedRangeOutMs && next > normalizedRangeOutMs) {
                setRangeOutMs(next);
              }
            }}
            style={{ width: 80 }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          Out
          <input
            type="number"
            min={0}
            max={safeDurationMs}
            value={normalizedRangeOutMs}
            onChange={(e) => {
              const next = clampToRange(Number(e.target.value), 0, safeDurationMs);
              setRangeOutMs(next);
              if (normalizedRangeInMs && next < normalizedRangeInMs) {
                setRangeInMs(next);
              }
            }}
            style={{ width: 80 }}
          />
        </label>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          {selectedId ? `Selected: ${selectedId}` : 'No selection'}
        </div>
      </div>
      <TimelineTimeScale durationMs={durationMs} />
      <div style={{ position: 'relative', paddingBottom: 8 }}>
        <TimelinePlayhead frameTime={frameTime} durationMs={durationMs} />
        <TimelineTrackList
          animations={animations}
          frameTime={frameTime}
          selectedNodeId={selectedId}
          readOnly={isAnimationWorkspace}
        />
      </div>
      <TimelineScrubber
        duration={durationMs}
        frameTime={frameTime}
        onScrub={handleScrub}
      />
    </div>
  );
}
