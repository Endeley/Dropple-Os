const TIME_AUTHORING_TOOL_IDS = new Set(['keyframe', 'cut', 'trim', 'overlay']);

export function isTimeAuthoringTool(activeTool) {
    return TIME_AUTHORING_TOOL_IDS.has(String(activeTool ?? '').trim());
}

export function getSelectedNodeMotionClipCount({ document = null, nodeId = null } = {}) {
    if (!nodeId) return 0;

    return Object.values(document?.motion?.clips ?? {}).filter((clip) => clip?.target === nodeId).length;
}

export function hasTimelineRelevance({
    capabilitySurface = null,
    document = null,
    selectedNode = null,
    activeTool = null,
} = {}) {
    if (!capabilitySurface?.showTransitionTimeline) return false;

    const nodeId = selectedNode?.id ?? null;
    const selectedNodeMotionClipCount = getSelectedNodeMotionClipCount({
        document,
        nodeId,
    });

    if (selectedNodeMotionClipCount > 0) return true;

    if (nodeId && isTimeAuthoringTool(activeTool)) return true;

    return false;
}
