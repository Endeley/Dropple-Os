import { DefaultCanvasPolicy } from '@/core/contracts/CanvasPolicy.js';
import { resolveCanvasSurface } from '@/workspaces/registry/canvasSurfacePolicy.js';

const DEFAULT_WORKSPACE_ID = 'graphic';
const DEFAULT_VIEWPORT = { x: 0, y: 0, scale: 1 };

export function createDefaultWorkspaceState() {
  return {
    id: DEFAULT_WORKSPACE_ID,
    canvasPolicy: DefaultCanvasPolicy,
    viewport: { ...DEFAULT_VIEWPORT },
    canvasSurface: resolveCanvasSurface({ id: DEFAULT_WORKSPACE_ID }),
    policy: null,
    ui: null,
    timeline: null,
    profile: null,
    enabledTriggerTypes: new Set(),
    allowedEventTypes: new Set(),
  };
}

function resolveCanvasPolicyFromDef(workspaceDef, fallback) {
  return (
    workspaceDef?.canvas?.policy ??
    workspaceDef?.canvasPolicy ??
    fallback ??
    DefaultCanvasPolicy
  );
}

function resolveCanvasSurfaceFromDef(workspaceDef, fallbackId) {
  const surface =
    workspaceDef?.canvas?.surface ?? workspaceDef?.canvasSurface ?? null;
  if (surface) return surface;
  return resolveCanvasSurface(workspaceDef ?? { id: fallbackId });
}

export function applyWorkspaceActivation(current, workspaceDef) {
  const base = current ?? createDefaultWorkspaceState();
  if (!workspaceDef?.id) return base;

  return {
    ...base,
    ...workspaceDef,
    id: workspaceDef.id,
    canvasPolicy: resolveCanvasPolicyFromDef(workspaceDef, base.canvasPolicy),
    viewport: { ...DEFAULT_VIEWPORT },
    canvasSurface: resolveCanvasSurfaceFromDef(workspaceDef, base.id),
    enabledTriggerTypes: new Set(workspaceDef?.events?.enabledTriggerTypes ?? []),
    allowedEventTypes: new Set(workspaceDef?.events?.allowedEventTypes ?? []),
  };
}

export function applyViewportUpdate(current, nextViewport) {
  if (!nextViewport) return current ?? createDefaultWorkspaceState();
  const base = current ?? createDefaultWorkspaceState();
  return {
    ...base,
    viewport: {
      ...base.viewport,
      ...nextViewport,
    },
  };
}

export function applyCanvasSurfaceUpdate(current, surface) {
  if (!surface) return current ?? createDefaultWorkspaceState();
  const base = current ?? createDefaultWorkspaceState();
  return {
    ...base,
    canvasSurface: surface,
  };
}
