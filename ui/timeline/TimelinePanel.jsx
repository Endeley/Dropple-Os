'use client';

import { useEffect, useRef, useState } from 'react';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import { runAnimationPreview } from '@/runtime/animation/runAnimationPreview.js';
import { cancelAnimationPreview } from '@/runtime/animation/cancelAnimationPreview.js';
import TimelineScrubber from './TimelineScrubber.jsx';
import TimelinePlayhead from './TimelinePlayhead.jsx';
import TimelineTrackList from './TimelineTrackList.jsx';
import TimelineTimeScale from './TimelineTimeScale.jsx';

export default function TimelinePanel({ designState }) {
  const [currentTime, setCurrentTime] = useState(0);
  const cancelRef = useRef(null);

  const runtimeState = getRuntimeState();
  const animations = designState?.timeline?.animations;
  const durationMs = animations?.clips
    ? Object.values(animations.clips).reduce(
        (max, clip) => Math.max(max, clip?.durationMs || 0),
        0
      )
    : 0;

  useEffect(() => {
    return () => {
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      cancelAnimationPreview();
    };
  }, []);

  useEffect(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
  }, [designState]);

  if (runtimeState?.__isReplaying) return null;
  if (!animations?.clips) return null;

  function handleScrub(timeMs) {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }

    const preview = runAnimationPreview({
      designState,
      timeMs,
    });

    cancelRef.current = preview?.cancel || null;
    setCurrentTime(timeMs);
  }

  return (
    <div
      style={{
        borderTop: '1px solid #e5e7eb',
        background: '#fafafa',
        padding: 8,
      }}
    >
      <TimelineTimeScale durationMs={durationMs} />
      <div style={{ position: 'relative', paddingBottom: 8 }}>
        <TimelinePlayhead currentTime={currentTime} durationMs={durationMs} />
        <TimelineTrackList animations={animations} />
      </div>
      <TimelineScrubber
        duration={durationMs}
        currentTime={currentTime}
        onScrub={handleScrub}
      />
    </div>
  );
}
