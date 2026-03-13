"use client";

import { useMemo } from "react";
import { getRuntimeSnapshot, getWorkspaceProjection } from "@/runtime/projection";
import { useTimelineSelectionStore } from "@/ui/timeline/useTimelineSelectionStore.js";
import { commitCurveChange } from "./commitCurveChange.js";
import BezierCurveCanvas from "./BezierCurveCanvas.jsx";
import { getWorkspaceActivation } from "@/ui/bridges/workspaceActivationFacade.js";

function isBezier(easing) {
  return easing && typeof easing === "object" && easing.type === "bezier";
}

export default function CurveEditorPanel({ capabilities }) {
  const selection = useTimelineSelectionStore((s) => s.selectedKeyframeIds);
  const selectedKeyframeId = selection.size ? Array.from(selection)[0] : null;
  const workspaceId = getWorkspaceProjection()?.id ?? "graphic";
  const workspace = getWorkspaceActivation(workspaceId);
  const canRender = capabilities?.animation === true || workspace?.capabilities?.has('animation') === true;

  const keyframe = useMemo(() => {
    if (!selectedKeyframeId) return null;
    const state = getRuntimeSnapshot();
    return state?.timeline?.animations?.keyframes?.[selectedKeyframeId] || null;
  }, [selectedKeyframeId]);

  const easing = keyframe?.easing || "linear";
  const bezierActive = isBezier(easing);

  if (!canRender) return null;

  if (!selectedKeyframeId || !keyframe || !bezierActive) return null;

  function commit(nextEasing) {
    if (!nextEasing || !isBezier(nextEasing)) return;
    commitCurveChange({ keyframeId: selectedKeyframeId, easing: nextEasing });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "#64748b" }}>Keyframe: {selectedKeyframeId}</div>
      <BezierCurveCanvas key={selectedKeyframeId} easing={easing} onCommit={commit} />
      <div style={{ fontSize: 12 }}>
        Easing: bezier ({easing.in?.x?.toFixed?.(2) ?? "?"},{easing.in?.y?.toFixed?.(2) ?? "?"}) → ({easing.out?.x?.toFixed?.(2) ?? "?"},{easing.out?.y?.toFixed?.(2) ?? "?"})
      </div>
    </div>
  );
}
