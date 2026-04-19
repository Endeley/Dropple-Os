import { DefaultCanvasPolicy } from '@/core/contracts/CanvasPolicy.js';

const DEFAULT_WORKSPACE_ID = 'graphic';
const DEFAULT_VIEWPORT = { x: 0, y: 0, scale: 1 };
const DEFAULT_CANVAS_SURFACE = {
    type: 'smooth',
    snap: false,
};

export function createDefaultWorkspaceState() {
    return {
        id: DEFAULT_WORKSPACE_ID,
        canvasPolicy: DefaultCanvasPolicy,
        viewport: { ...DEFAULT_VIEWPORT },
        canvasSurface: { ...DEFAULT_CANVAS_SURFACE },

        // 🔥 IMPORTANT: ensure tools always exist
        tools: [],

        policy: null,
        ui: null,
        timeline: null,
        profile: null,

        enabledTriggerTypes: new Set(),
        allowedEventTypes: new Set(),
    };
}

function resolveCanvasPolicyFromDef(workspaceDef, fallback) {
    return workspaceDef?.canvas?.policy ?? workspaceDef?.canvasPolicy ?? fallback ?? DefaultCanvasPolicy;
}

function resolveCanvasSurfaceFromDef(workspaceDef) {
    const surface = workspaceDef?.canvas?.surface ?? workspaceDef?.canvasSurface ?? null;

    if (surface) return surface;

    return { ...DEFAULT_CANVAS_SURFACE };
}

function resolveEventSet(values, fallbackValues) {
    if (values instanceof Set) {
        return new Set(values);
    }

    if (Array.isArray(values)) {
        return new Set(values);
    }

    if (fallbackValues instanceof Set) {
        return new Set(fallbackValues);
    }

    if (Array.isArray(fallbackValues)) {
        return new Set(fallbackValues);
    }

    return new Set();
}

// 🔥 FULLY FIXED — TOOL NORMALIZATION + SAFE MERGE
export function applyWorkspaceActivation(current, workspaceDef) {
    const base = current ?? createDefaultWorkspaceState();

    if (!workspaceDef?.id) {
        return base;
    }

    // 🔥 CRITICAL FIX: normalize tools from all possible locations
    const normalizedTools = Array.isArray(workspaceDef?.tools) ? workspaceDef.tools : Array.isArray(workspaceDef?.ui?.tools) ? workspaceDef.ui.tools : [];

    return {
        ...base,

        // ⚠️ DO NOT blindly spread workspaceDef over everything critical
        ...workspaceDef,

        id: workspaceDef.id,

        // 🔥 FORCE tools into runtime truth (THIS FIXES YOUR TESTS)
        tools: normalizedTools,

        canvasPolicy: resolveCanvasPolicyFromDef(workspaceDef, base.canvasPolicy),

        viewport: { ...DEFAULT_VIEWPORT },

        canvasSurface: resolveCanvasSurfaceFromDef(workspaceDef),

        enabledTriggerTypes: resolveEventSet(
            workspaceDef?.enabledTriggerTypes,
            workspaceDef?.events?.enabledTriggerTypes,
        ),

        allowedEventTypes: resolveEventSet(
            workspaceDef?.allowedEventTypes,
            workspaceDef?.events?.allowedEventTypes,
        ),
    };
}

export function applyViewportUpdate(current, nextViewport) {
    const base = current ?? createDefaultWorkspaceState();

    if (!nextViewport) return base;

    return {
        ...base,
        viewport: {
            ...base.viewport,
            ...nextViewport,
        },
    };
}

export function applyCanvasSurfaceUpdate(current, surface) {
    const base = current ?? createDefaultWorkspaceState();

    if (!surface) return base;

    return {
        ...base,
        canvasSurface: surface,
    };
}
