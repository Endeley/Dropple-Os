"use client";

import { useMemo, useRef, useState } from "react";
import CurveHandle from "./CurveHandle.jsx";

const easingSamples = {
  linear: (t) => t,
  "ease-in": (t) => t * t,
  "ease-out": (t) => t * (2 - t),
  "ease-in-out": (t) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};

const easingKeys = Object.keys(easingSamples);

function easingAt(t, easing) {
  const fn = easingSamples[easing] || easingSamples.linear;
  return fn(t);
}

function pickNearestEasing(yValue) {
  let best = "linear";
  let bestDistance = Infinity;

  easingKeys.forEach((key) => {
    const candidate = easingAt(0.5, key);
    const dist = Math.abs(candidate - yValue);
    if (dist < bestDistance) {
      bestDistance = dist;
      best = key;
    }
  });

  return best;
}

export default function CurveCanvas({ easing, onCommit }) {
  const svgRef = useRef(null);
  const [draftEasing, setDraftEasing] = useState(() => easing || "linear");
  const [dragging, setDragging] = useState(false);
  const displayEasing = dragging ? draftEasing : easing || "linear";

  const points = useMemo(() => {
    const samples = [];
    const steps = 30;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      samples.push({ x: t, y: easingAt(t, displayEasing) });
    }
    return samples;
  }, [displayEasing]);

  const path = points
    .map((point, index) => {
      const x = 12 + point.x * 196;
      const y = 108 - point.y * 96;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const midY = easingAt(0.5, displayEasing);
  const handleX = 12 + 0.5 * 196;
  const handleY = 108 - midY * 96;

  function handlePointerMove(event) {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const y = Math.min(108, Math.max(12, event.clientY - rect.top));
    const normalized = 1 - (y - 12) / 96;
    const next = pickNearestEasing(normalized);
    setDraftEasing(next);
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraftEasing(displayEasing);
    setDragging(true);
  }

  function handlePointerUp(event) {
    if (dragging) {
      onCommit?.(draftEasing);
    }
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="120"
      viewBox="0 0 220 120"
      style={{ background: "#f8fafc", borderRadius: 8 }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <rect x="12" y="12" width="196" height="96" fill="#ffffff" rx="6" />
      <path d={path} stroke="#2563eb" strokeWidth="2" fill="none" />
      <CurveHandle x={handleX} y={handleY} active={dragging} onPointerDown={handlePointerDown} />
    </svg>
  );
}
