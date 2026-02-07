"use client";

import { useMemo, useRef, useState } from "react";
import CurveHandle from "./CurveHandle.jsx";

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function normalizeBezier(easing) {
  if (easing && typeof easing === "object" && easing.type === "bezier") {
    return {
      type: "bezier",
      in: {
        x: clamp01(easing.in?.x ?? 0.25),
        y: clamp01(easing.in?.y ?? 0.25),
      },
      out: {
        x: clamp01(easing.out?.x ?? 0.75),
        y: clamp01(easing.out?.y ?? 0.75),
      },
    };
  }

  return {
    type: "bezier",
    in: { x: 0.25, y: 0.25 },
    out: { x: 0.75, y: 0.75 },
  };
}

export default function BezierCurveCanvas({ easing, onCommit }) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [draft, setDraft] = useState(() => normalizeBezier(easing));

  const current = dragging ? draft : normalizeBezier(easing);

  const frame = useMemo(
    () => ({
      x: 12,
      y: 12,
      width: 196,
      height: 96,
    }),
    []
  );

  const start = { x: frame.x, y: frame.y + frame.height };
  const end = { x: frame.x + frame.width, y: frame.y };

  const inHandle = {
    x: frame.x + current.in.x * frame.width,
    y: frame.y + (1 - current.in.y) * frame.height,
  };

  const outHandle = {
    x: frame.x + current.out.x * frame.width,
    y: frame.y + (1 - current.out.y) * frame.height,
  };

  const path = `M ${start.x} ${start.y} C ${inHandle.x} ${inHandle.y}, ${outHandle.x} ${outHandle.y}, ${end.x} ${end.y}`;

  function updateHandle(which, event) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = clamp01((event.clientX - rect.left - frame.x) / frame.width);
    const py = clamp01(1 - (event.clientY - rect.top - frame.y) / frame.height);

    setDraft((prev) => ({
      ...prev,
      [which]: { x: px, y: py },
    }));
  }

  function handlePointerDown(which) {
    return (event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraft(normalizeBezier(easing));
      setDragging(which);
    };
  }

  function handlePointerMove(event) {
    if (!dragging) return;
    updateHandle(dragging, event);
  }

  function handlePointerUp(event) {
    if (dragging) {
      onCommit?.(draft);
    }
    setDragging(null);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="140"
      viewBox="0 0 220 140"
      style={{ background: "#f8fafc", borderRadius: 8 }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <rect x={frame.x} y={frame.y} width={frame.width} height={frame.height} fill="#ffffff" rx="6" />
      <path d={path} stroke="#2563eb" strokeWidth="2" fill="none" />

      <line x1={start.x} y1={start.y} x2={inHandle.x} y2={inHandle.y} stroke="#cbd5f5" strokeWidth="1" />
      <line x1={end.x} y1={end.y} x2={outHandle.x} y2={outHandle.y} stroke="#cbd5f5" strokeWidth="1" />

      <CurveHandle x={inHandle.x} y={inHandle.y} active={dragging === "in"} onPointerDown={handlePointerDown("in")} />
      <CurveHandle x={outHandle.x} y={outHandle.y} active={dragging === "out"} onPointerDown={handlePointerDown("out")} />
    </svg>
  );
}
