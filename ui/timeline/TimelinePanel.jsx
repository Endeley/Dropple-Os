'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { selectIsReplaying, useWorkspaceProjection } from '@/runtime/projection';
import { runAnimationPreview } from '@/runtime/animation/runAnimationPreview.js';
import { cancelAnimationPreview } from '@/runtime/animation/cancelAnimationPreview.js';
import TimelineScrubber from './TimelineScrubber.jsx';
import TimelinePlayhead from './TimelinePlayhead.jsx';
import TimelineTrackList from './TimelineTrackList.jsx';
import TimelineTimeScale from './TimelineTimeScale.jsx';
import ShotTimelineBar from './ShotTimelineBar.jsx';
import { useSelection } from '@/ui/workspace/shared/SelectionContext.jsx';
import { canvasBus } from '@/infrastructure/eventBus/canvasBus.js';
import { useTimelineStore } from '@/runtime/stores/useTimelineStore.js';
import { collectKeyframeTimes, getNearestKeyframeTime, getNextKeyframeTime, getPrevKeyframeTime } from '@/runtime/timeline/keyframeTimeUtils.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useDispatcher } from '@/ui/workspace/root/DispatcherProvider/DispatcherContext.jsx';
import { EventTypes } from '@/core/events/eventTypes.js';

export default function TimelinePanel({ designState }) {
  const workspaceId = useWorkspaceProjection((s) => s.id);
  const isAnimationWorkspace = workspaceId === 'animation';
  const sceneGraph = useRuntimeStore((s) => s.sceneGraph);
  const runtimeScene = useRuntimeStore((s) => s.scene);
  const frameTime = useRuntimeStore((s) => s.frameTime) ?? 0;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [rangeInMs, setRangeInMs] = useState(0);
  const [rangeOutMs, setRangeOutMs] = useState(0);
  const cancelRef = useRef(null);
  const dispatcher = useDispatcher();
  const { selectedIds } = useSelection() || {};
  const snapToKeyframes = useTimelineStore((s) => s.snapToKeyframes);
  const previewInterpolation = useTimelineStore((s) => s.previewInterpolation);
  const setSnapToKeyframes = useTimelineStore((s) => s.setSnapToKeyframes);
  const setPreviewInterpolation = useTimelineStore((s) => s.setPreviewInterpolation);
  const setDuration = useTimelineStore((s) => s.setDuration);
  const setKeyframeTimes = useTimelineStore((s) => s.setKeyframeTimes);
  const setIsPlayingFlag = useTimelineStore((s) => s.setIsPlaying);
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
      setRangeInMs(0);
      setRangeOutMs(0);
      setDuration?.(0);
      setKeyframeTimes?.([]);
      return;
    }
    setRangeInMs((prev) => Math.max(0, Math.min(prev, durationMs)));
    setRangeOutMs((prev) => {
      const next = Number.isFinite(prev) && prev > 0 ? prev : durationMs;
      return Math.max(0, Math.min(next, durationMs));
    });
    setDuration?.(durationMs);
    setKeyframeTimes?.(collectKeyframeTimes(animations));
  }, [durationMs, setDuration, setKeyframeTimes, animations]);

  useEffect(() => {
    setKeyframeTimes?.(collectKeyframeTimes(animations));
  }, [animations, setKeyframeTimes]);

  useEffect(() => {
    return () => {
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      pausePlayback();
      cancelAnimationPreview();
    };
  }, []);

  useEffect(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    pausePlayback();
  }, [designState]);

  if (isReplaying) return null;
  if (!animations?.clips) return null;

  function resolvePreviewTime(timeMs) {
    if (previewInterpolation === 'hold') {
      const times = useTimelineStore.getState().keyframeTimes || [];
      return getPrevKeyframeTime(times, timeMs) ?? timeMs;
    }
    return timeMs;
  }

  function clampToRange(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function resolveSnappedTime(timeMs, { forceSnap = false } = {}) {
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
  }

  function seekTime(timeMs, options = {}) {
    const next = resolveSnappedTime(timeMs, options);
    dispatcher.dispatch({
      type: EventTypes.CLOCK_SEEK,
      payload: { time: next },
    });
    return next;
  }

  function handleScrub(timeMs) {
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
  }

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

  function pausePlayback() {
    dispatcher.dispatch({ type: EventTypes.CLOCK_PAUSE });
    setIsPlaying(false);
    setIsPlayingFlag?.(false);
  }

  function startPlayback() {
    if (!animations?.clips) return;
    dispatcher.dispatch({ type: EventTypes.CLOCK_PLAY });
    setIsPlaying(true);
    setIsPlayingFlag?.(true);
  }

  function handleResetToIn() {
    const min = 0;
    const max = durationMs;
    const inMs = clampToRange(rangeInMs, min, max);
    handleScrub(inMs);
  }

  function handleStepFrame(direction) {
    const store = useTimelineStore.getState();
    const frameMs = 1000 / (store.fps || 24);
    const delta = direction > 0 ? frameMs : -frameMs;
    const nextTime = frameTime + delta;
    handleScrub(nextTime);
  }

  function handleStepKeyframe(direction) {
    const store = useTimelineStore.getState();
    const next = direction > 0
      ? getNextKeyframeTime(store.keyframeTimes, frameTime)
      : getPrevKeyframeTime(store.keyframeTimes, frameTime);
    if (Number.isFinite(next)) {
      handleScrub(next);
    }
  }

  useEffect(() => {
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
  }, [previewInterpolation]);

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

  return (
    <div
      style={{
        borderTop: '1px solid #e5e7eb',
        background: '#fafafa',
        padding: 8,
      }}
    >
      {isAnimationWorkspace && <ShotTimelineBar />}
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
            max={durationMs}
            value={rangeInMs}
            onChange={(e) => {
              const next = clampToRange(Number(e.target.value), 0, durationMs);
              setRangeInMs(next);
              if (rangeOutMs && next > rangeOutMs) {
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
            max={durationMs}
            value={rangeOutMs}
            onChange={(e) => {
              const next = clampToRange(Number(e.target.value), 0, durationMs);
              setRangeOutMs(next);
              if (rangeInMs && next < rangeInMs) {
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
