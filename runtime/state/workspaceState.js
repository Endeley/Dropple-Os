import { DefaultCanvasPolicy } from '@/core/contracts/CanvasPolicy.js';
import { resolveCanvasSurface } from '@/workspaces/registry/canvasSurfacePolicy.js';

let activeWorkspaceId = 'graphic'; // default
const defaultViewport = { x: 0, y: 0, scale: 1 };
const defaultSurface = resolveCanvasSurface({ id: activeWorkspaceId });
const workspaceState = {
    id: activeWorkspaceId,
    canvasPolicy: DefaultCanvasPolicy,
    viewport: defaultViewport,
    canvasSurface: defaultSurface,
};
const listeners = new Set();

function notify() {
    listeners.forEach((listener) => listener());
}

export function resolveCanvasPolicy(workspaceDef) {
    return workspaceDef?.canvasPolicy ?? DefaultCanvasPolicy;
}

export function resolveWorkspaceState(workspaceDef) {
    return {
        id: workspaceDef?.id ?? activeWorkspaceId,
        canvasPolicy: resolveCanvasPolicy(workspaceDef),
        viewport: { ...defaultViewport },
        canvasSurface: resolveCanvasSurface(workspaceDef),
    };
}

export function setActiveWorkspace(id, workspaceDef = null) {
    activeWorkspaceId = id;
    if (workspaceDef) {
        Object.assign(workspaceState, resolveWorkspaceState(workspaceDef));
    } else {
        workspaceState.id = id;
    }
    notify();
}

export function getActiveWorkspace() {
    return activeWorkspaceId;
}

export function getWorkspaceState() {
    return workspaceState;
}

export function subscribeWorkspaceState(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function setCanvasSurface(surface) {
    if (!surface) return;
    workspaceState.canvasSurface = surface;
    notify();
}

export function setViewport(nextViewport) {
    if (!nextViewport) return;
    workspaceState.viewport = {
        ...workspaceState.viewport,
        ...nextViewport,
    };
    notify();
}

export function updateViewport(updater) {
    if (!updater) return;
    const nextViewport =
        typeof updater === 'function' ? updater(workspaceState.viewport) : updater;
    setViewport(nextViewport);
}
