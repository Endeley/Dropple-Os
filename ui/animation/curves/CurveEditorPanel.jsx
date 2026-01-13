"use client";

import { useMemo } from "react";
import { getRuntimeState } from "@/runtime/state/runtimeState.js";
import { resolveWorkspacePolicy } from "@/workspaces/registry/resolveWorkspacePolicy.js";
import { getActiveWorkspace } from "@/runtime/state/workspaceState.js";
import { useTimelineSelectionStore } from "@/timeline/ui/useTimelineSelectionStore.js";
import CurveCanvas from "./CurveCanvas.jsx";
import CurvePresetPicker from "./CurvePresetPicker.jsx";
import { commitCurveChange } from "./commitCurveChange.js";

const allowedEasings = new Set([
  "linear",
  "ease-in",
  "ease-out",
  "ease-in-out",
]);

export default function CurveEditorPanel({ capabilities }) {
  const selection = useTimelineSelectionStore((s) => s.selectedKeyframeIds);
  const selectedKeyframeId = selection.size ? Array.from(selection)[0] : null;
  const workspaceId = getActiveWorkspace();
  const workspace = resolveWorkspacePolicy(workspaceId);
  const canRender = capabilities?.animation === true || workspace?.capabilities?.animation === true;

  const keyframe = useMemo(() => {
    if (!selectedKeyframeId) return null;
    const state = getRuntimeState();
    return state?.timeline?.animations?.keyframes?.[selectedKeyframeId] || null;
  }, [selectedKeyframeId]);

  const easing = keyframe?.easing || "linear";

  if (!canRender) return null;

  if (!selectedKeyframeId || !keyframe) {
    return (
      <div style={{ fontSize: 12, color: "#64748b" }}>
        <div style={{ fontWeight: 600, color: "#0f172a" }}>No keyframe selected</div>
        <div>Select a keyframe on the timeline to edit its easing curve.</div>
      </div>
    );
  }

  function commit(nextEasing) {
    if (!allowedEasings.has(nextEasing)) return;
    commitCurveChange({ keyframeId: selectedKeyframeId, easing: nextEasing });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "#64748b" }}>Keyframe: {selectedKeyframeId}</div>
      <CurveCanvas key={selectedKeyframeId} easing={easing} onCommit={commit} />
      <CurvePresetPicker easing={easing} onSelect={commit} />
      <div style={{ fontSize: 12 }}>Easing: {easing}</div>
    </div>
  );
}
