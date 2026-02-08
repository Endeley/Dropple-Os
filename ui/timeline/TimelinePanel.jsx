'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import { runAnimationPreview } from '@/runtime/animation/runAnimationPreview.js';
import { cancelAnimationPreview } from '@/runtime/animation/cancelAnimationPreview.js';
import TimelineScrubber from './TimelineScrubber.jsx';
import TimelinePlayhead from './TimelinePlayhead.jsx';
import TimelineTrackList from './TimelineTrackList.jsx';
import TimelineTimeScale from './TimelineTimeScale.jsx';
import { useSelection } from '@/ui/workspace/shared/SelectionContext.jsx';
import { canvasBus } from '@/ui/canvasBus.js';
import { useTimelineStore } from './useTimelineStore.js';
import { collectKeyframeTimes, getPrevKeyframeTime } from './keyframeTimeUtils.js';

export default function TimelinePanel({ designState }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [rangeInMs, setRangeInMs] = useState(0);
  const [rangeOutMs, setRangeOutMs] = useState(0);
  const cancelRef = useRef(null);
  const playbackRef = useRef({ rafId: null, cancelPreview: null, running: false });
  const { selectedIds } = useSelection() || {};
  const snapToKeyframes = useTimelineStore((s) => s.snapToKeyframes);
  const previewInterpolation = useTimelineStore((s) => s.previewInterpolation);
  const stepForwardFrame = useTimelineStore((s) => s.stepForwardFrame);
  const stepBackwardFrame = useTimelineStore((s) => s.stepBackwardFrame);
  const stepNextKeyframe = useTimelineStore((s) => s.stepNextKeyframe);
  const stepPreviousKeyframe = useTimelineStore((s) => s.stepPreviousKeyframe);
  const setSnapToKeyframes = useTimelineStore((s) => s.setSnapToKeyframes);
  const setPreviewInterpolation = useTimelineStore((s) => s.setPreviewInterpolation);
  const setDuration = useTimelineStore((s) => s.setDuration);
  const setKeyframeTimes = useTimelineStore((s) => s.setKeyframeTimes);
  const selectedId = selectedIds?.size === 1 ? Array.from(selectedIds)[0] : null;
  const selectedNode = useMemo(
    () => (selectedId ? designState?.nodes?.[selectedId] : null),
    [designState, selectedId]
  );
  const selectedX = selectedNode?.layout?.x;
  const canSetKeyframe = Boolean(selectedId && Number.isFinite(selectedX));

  const runtimeState = getRuntimeState();
  const animations = designState?.timeline?.animations;
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
      stopPlayback();
      cancelAnimationPreview();
    };
  }, []);

  useEffect(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    stopPlayback();
  }, [designState]);

  if (runtimeState?.__isReplaying) return null;
  if (!animations?.clips) return null;

  function resolvePreviewTime(timeMs) {
    if (previewInterpolation === 'hold') {
      const times = useTimelineStore.getState().keyframeTimes || [];
      return getPrevKeyframeTime(times, timeMs) ?? timeMs;
    }
    return timeMs;
  }

  function handleScrub(timeMs) {
    if (isPlaying) {
      stopPlayback();
    }
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }

    const store = useTimelineStore.getState();
    store.setTime(timeMs, { forceSnap: true });
    const snappedTime = store.currentTime;
    const previewTime = resolvePreviewTime(snappedTime);

    const preview = runAnimationPreview({
      designState,
      timeMs: previewTime,
    });

    cancelRef.current = preview?.cancel || null;
    setCurrentTime(snappedTime);
  }

  function clampToRange(value, min, max) {
    return Math.max(min, Math.min(value, max));
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

  function stopPlayback() {
    playbackRef.current.running = false;

    if (playbackRef.current.rafId) {
      cancelAnimationFrame(playbackRef.current.rafId);
      playbackRef.current.rafId = null;
    }

    if (playbackRef.current.cancelPreview) {
      playbackRef.current.cancelPreview();
      playbackRef.current.cancelPreview = null;
    }

    setIsPlaying(false);
  }

  function startPlayback() {
    if (!animations?.clips) return;
    if (runtimeState?.__isReplaying) return;

    stopPlayback();

    const safeSpeed = Number.isFinite(playbackSpeed) && playbackSpeed > 0 ? playbackSpeed : 1;
    const min = 0;
    const max = durationMs;
    const inMs = clampToRange(rangeInMs ?? 0, min, max);
    const outMs = clampToRange(rangeOutMs ?? max, min, max);
    if (!Number.isFinite(outMs) || outMs <= inMs) return;

    const windowDuration = outMs - inMs;
    const startTime = performance.now();
    playbackRef.current.running = true;

    function tick(now) {
      if (!playbackRef.current.running) return;

      const elapsed = (now - startTime) * safeSpeed;
      let localTime = elapsed % windowDuration;

      if (!isLooping && elapsed >= windowDuration) {
        localTime = windowDuration;
        stopPlayback();
      }

      const effectiveTime = inMs + localTime;
      setCurrentTime(effectiveTime);

      const preview = runAnimationPreview({
        designState,
        durationMs: 0,
        onComplete: null,
      });

      playbackRef.current.cancelPreview = preview?.cancel || null;
      playbackRef.current.rafId = requestAnimationFrame(tick);
    }

    playbackRef.current.rafId = requestAnimationFrame(tick);
    setIsPlaying(true);
  }

  function handleResetToIn() {
    const min = 0;
    const max = durationMs;
    const inMs = clampToRange(rangeInMs, min, max);
    handleScrub(inMs);
  }

  function handleStepFrame(direction) {
    if (direction > 0) {
      stepForwardFrame?.();
    } else {
      stepBackwardFrame?.();
    }
    const nextTime = useTimelineStore.getState().currentTime;
    handleScrub(nextTime);
  }

  function handleStepKeyframe(direction) {
    if (direction > 0) {
      stepNextKeyframe?.();
    } else {
      stepPreviousKeyframe?.();
    }
    const nextTime = useTimelineStore.getState().currentTime;
    handleScrub(nextTime);
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
    if (!canSetKeyframe) return;

    canvasBus.emit('intent.animation.keyframe.create', {
      nodeId: selectedId,
      property: 'layout.x',
      timeMs: currentTime,
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
          onClick={() => (isPlaying ? stopPlayback() : startPlayback())}
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
        <TimelinePlayhead currentTime={currentTime} durationMs={durationMs} />
        <TimelineTrackList
          animations={animations}
          currentTime={currentTime}
          selectedNodeId={selectedId}
        />
      </div>
      <TimelineScrubber
        duration={durationMs}
        currentTime={currentTime}
        onScrub={handleScrub}
      />
    </div>
  );
}
