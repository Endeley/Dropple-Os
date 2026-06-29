import { clampZoom } from '@/core/viewport/cameraPolicy.js';

const DEFAULT_POINT = Object.freeze({ x: 0, y: 0 });
const DEFAULT_HOME_SCALE = 1;
const DEFAULT_FIRST_FRAME_SIZE = Object.freeze({
    width: 1440,
    height: 1024,
});
const DEFAULT_FIRST_FRAME_HOME_ANCHOR = Object.freeze({
    x: 192,
    y: 144,
});

function finiteOr(value, fallback) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizePoint(point = DEFAULT_POINT) {
    return Object.freeze({
        x: finiteOr(point?.x, DEFAULT_POINT.x),
        y: finiteOr(point?.y, DEFAULT_POINT.y),
    });
}

function normalizeSize(size = DEFAULT_FIRST_FRAME_SIZE) {
    return Object.freeze({
        width: Math.max(1, finiteOr(size?.width, DEFAULT_FIRST_FRAME_SIZE.width)),
        height: Math.max(1, finiteOr(size?.height, DEFAULT_FIRST_FRAME_SIZE.height)),
    });
}

function normalizeHostRect(hostRect = null) {
    if (!hostRect) return null;

    const width = finiteOr(hostRect?.width, 0);
    const height = finiteOr(hostRect?.height, 0);

    if (width <= 0 || height <= 0) return null;

    return Object.freeze({ width, height });
}

function isCreateWorldNavigationGeographyContext({ workspaceId = null, modeId = null } = {}) {
    return workspaceId === 'uiux' || modeId === 'uiux';
}

function hasCreateWorldProjectHistory({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
    worldHistory = null,
} = {}) {
    if (!isCreateWorldNavigationGeographyContext({ workspaceId, modeId })) return false;
    if (worldHistory?.firstRememberedArtifact?.nodeId) return true;
    return Number(nodeCount) > 0;
}

function resolveCreateWorldFirstRememberedArtifact({
    workspaceId = null,
    modeId = null,
    worldHistory = null,
} = {}) {
    if (!isCreateWorldNavigationGeographyContext({ workspaceId, modeId })) return null;
    const entry = worldHistory?.firstRememberedArtifact ?? null;
    if (!entry?.nodeId) return null;
    return Object.freeze({
        nodeId: entry.nodeId,
        nodeType: entry.nodeType ?? null,
        parentId: entry.parentId ?? null,
        layout: entry.layout
            ? Object.freeze({
                  x: finiteOr(entry.layout.x, 0),
                  y: finiteOr(entry.layout.y, 0),
                  width: Math.max(1, finiteOr(entry.layout.width, 1)),
                  height: Math.max(1, finiteOr(entry.layout.height, 1)),
              })
            : null,
    });
}

function resolveCreateWorldOrigin({ workspaceId = null, modeId = null } = {}) {
    if (!isCreateWorldNavigationGeographyContext({ workspaceId, modeId })) {
        return normalizePoint(DEFAULT_POINT);
    }

    return normalizePoint(DEFAULT_POINT);
}

function resolveCreateWorldHome({ workspaceId = null, modeId = null } = {}) {
    if (!isCreateWorldNavigationGeographyContext({ workspaceId, modeId })) {
        return normalizePoint(DEFAULT_POINT);
    }

    return normalizePoint(DEFAULT_POINT);
}

function resolveCreateWorldCurrentFocus({
    workspaceId = null,
    modeId = null,
    viewport = null,
    hostRect = null,
    fallback = null,
} = {}) {
    const normalizedFallback =
        normalizePoint(fallback ?? resolveCreateWorldHome({ workspaceId, modeId }));
    const normalizedHostRect = normalizeHostRect(hostRect);
    const scale = finiteOr(viewport?.scale, DEFAULT_HOME_SCALE);

    if (!normalizedHostRect || scale <= 0) {
        return normalizedFallback;
    }

    return Object.freeze({
        x: finiteOr(viewport?.x, normalizedFallback.x) + normalizedHostRect.width / (2 * scale),
        y: finiteOr(viewport?.y, normalizedFallback.y) + normalizedHostRect.height / (2 * scale),
    });
}

function resolveCreateWorldHomeViewport({
    workspaceId = null,
    modeId = null,
    hostRect = null,
    scale = DEFAULT_HOME_SCALE,
    home = null,
    viewport = null,
} = {}) {
    const normalizedHostRect = normalizeHostRect(hostRect);
    if (!normalizedHostRect) return null;

    const normalizedHome = normalizePoint(
        home ?? resolveCreateWorldHome({ workspaceId, modeId }),
    );
    const safeScale = Math.max(0.05, finiteOr(scale, DEFAULT_HOME_SCALE));

    return Object.freeze({
        ...viewport,
        x: normalizedHome.x - normalizedHostRect.width / (2 * safeScale),
        y: normalizedHome.y - normalizedHostRect.height / (2 * safeScale),
        scale: safeScale,
        width: normalizedHostRect.width,
        height: normalizedHostRect.height,
    });
}

function resolveCreateWorldArtifactFocusViewport({
    bounds = null,
    hostRect = null,
    viewport = null,
} = {}) {
    const normalizedHostRect = normalizeHostRect(hostRect);
    if (!normalizedHostRect || !bounds) return null;

    const width = Math.max(1, finiteOr(bounds?.width, 0));
    const height = Math.max(1, finiteOr(bounds?.height, 0));
    const x = finiteOr(bounds?.x, 0);
    const y = finiteOr(bounds?.y, 0);
    const currentScale = Math.max(0.05, finiteOr(viewport?.scale, DEFAULT_HOME_SCALE));
    const nextScale = clampZoom(currentScale);
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    return Object.freeze({
        ...viewport,
        x: centerX - normalizedHostRect.width / (2 * nextScale),
        y: centerY - normalizedHostRect.height / (2 * nextScale),
        scale: nextScale,
        width: normalizedHostRect.width,
        height: normalizedHostRect.height,
    });
}

function shouldInitializeCreateWorldHomeViewport({
    workspaceId = null,
    modeId = null,
    viewport = null,
    hostRect = null,
    nodeCount = 0,
    worldHistory = null,
} = {}) {
    if (!isCreateWorldNavigationGeographyContext({ workspaceId, modeId })) return false;
    if (hasCreateWorldProjectHistory({ workspaceId, modeId, nodeCount, worldHistory })) return false;
    if (!normalizeHostRect(hostRect)) return false;

    const currentX = finiteOr(viewport?.x, 0);
    const currentY = finiteOr(viewport?.y, 0);
    const currentScale = finiteOr(viewport?.scale, DEFAULT_HOME_SCALE);

    return currentX === 0 && currentY === 0 && currentScale === DEFAULT_HOME_SCALE;
}

function resolveCreateWorldFirstArtifactBounds({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
    worldHistory = null,
    home = null,
    size = DEFAULT_FIRST_FRAME_SIZE,
    anchor = DEFAULT_FIRST_FRAME_HOME_ANCHOR,
    offset = null,
} = {}) {
    if (!isCreateWorldNavigationGeographyContext({ workspaceId, modeId })) return null;
    if (hasCreateWorldProjectHistory({ workspaceId, modeId, nodeCount, worldHistory })) return null;

    const normalizedHome = normalizePoint(
        home ?? resolveCreateWorldHome({ workspaceId, modeId }),
    );
    const normalizedSize = normalizeSize(size);
    const normalizedAnchor = normalizePoint(anchor ?? DEFAULT_FIRST_FRAME_HOME_ANCHOR);
    const normalizedOffset = normalizePoint(offset ?? DEFAULT_POINT);

    return Object.freeze({
        x: normalizedHome.x - normalizedAnchor.x + normalizedOffset.x,
        y: normalizedHome.y - normalizedAnchor.y + normalizedOffset.y,
        width: normalizedSize.width,
        height: normalizedSize.height,
    });
}

export const createWorldNavigationGeographyPolicy = Object.freeze({
    isNavigationGeographyContext: isCreateWorldNavigationGeographyContext,
    hasProjectHistory: hasCreateWorldProjectHistory,
    resolveFirstRememberedArtifact: resolveCreateWorldFirstRememberedArtifact,
    resolveOrigin: resolveCreateWorldOrigin,
    resolveHome: resolveCreateWorldHome,
    resolveCurrentFocus: resolveCreateWorldCurrentFocus,
    resolveHomeViewport: resolveCreateWorldHomeViewport,
    resolveArtifactFocusViewport: resolveCreateWorldArtifactFocusViewport,
    shouldInitializeHomeViewport: shouldInitializeCreateWorldHomeViewport,
    resolveFirstArtifactBounds: resolveCreateWorldFirstArtifactBounds,
});

export function isCreateUiWorld(args = {}) {
    return createWorldNavigationGeographyPolicy.isNavigationGeographyContext(args);
}

export function hasProjectHistory(args = {}) {
    return createWorldNavigationGeographyPolicy.hasProjectHistory(args);
}

export function resolveFirstRememberedArtifact(args = {}) {
    return createWorldNavigationGeographyPolicy.resolveFirstRememberedArtifact(args);
}

export function resolveProjectOrigin(args = {}) {
    return createWorldNavigationGeographyPolicy.resolveOrigin(args);
}

export function resolveProjectHome(args = {}) {
    return createWorldNavigationGeographyPolicy.resolveHome(args);
}

export function resolveCurrentFocus(args = {}) {
    return createWorldNavigationGeographyPolicy.resolveCurrentFocus(args);
}

export function resolveProjectHomeViewport(args = {}) {
    return createWorldNavigationGeographyPolicy.resolveHomeViewport(args);
}

export function resolveArtifactFocusViewport(args = {}) {
    return createWorldNavigationGeographyPolicy.resolveArtifactFocusViewport(args);
}

export function shouldInitializeProjectHomeViewport(args = {}) {
    return createWorldNavigationGeographyPolicy.shouldInitializeHomeViewport(args);
}

export function resolveFirstFrameBounds(args = {}) {
    return createWorldNavigationGeographyPolicy.resolveFirstArtifactBounds(args);
}
