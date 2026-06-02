export {
    getWorkspaceDefinition,
    getWorkspaceRegistry,
    hasWorkspaceDefinition,
    listWorkspaceDefinitions,
    resolveWorkspaceId,
} from './workspaceRegistry.js';
export {
    CANONICAL_WORKSPACES,
    listCanonicalModesForWorkspace,
    listCanonicalWorkspaceIds,
} from './canonicalRegistry.js';
export {
    LEGACY_WORKSPACE_MAP,
    getLegacyWorkspaceEntry,
    hasLegacyWorkspaceEntry,
    listLegacyWorkspaceEntryIds,
} from './legacyMapping.js';
export {
    OVERLAY_REGISTRY,
    getOverlayEntry,
    getOverlaysForMode,
    hasOverlayEntry,
    listOverlayEntryIds,
    listOverlayIds,
    resolveOverlayByLegacyMode,
} from './overlayRegistry.js';
export { resolveWorkspaceContext } from './resolveWorkspaceContext.js';
export { resolveCanonicalWorkspaceOverlayContext } from './modeResolution.js';

export {
    getResolvedWorkspaceDefinition,
    getWorkspaceActivation,
} from './workspaceEngine.js';

export { CanvasSurfaceTypes } from './canvasSurfacePolicy.js';

export {
    MEDIA_DEFAULT_MODE,
    MEDIA_MODE_IDS,
    MEDIA_WORKSPACE_ID,
    getMediaWorkspaceDefinition,
    isMediaWorkspaceId,
    listMediaWorkspaceModes,
    resolveMediaWorkspaceMode,
} from './mediaWorkspace.js';

export {
    PROJECT_PERSPECTIVES,
    getProjectPerspectiveDefinition,
    hasProjectPerspective,
    listProjectPerspectiveIds,
    resolveInitialProjectPerspectiveContext,
    resolveProjectPerspectiveFocus,
    resolveProjectPerspectiveContext,
} from './projectPerspectiveRouter.js';
export {
    buildProjectBlueprintStartRoute,
    buildProjectEnvironmentStartRoute,
} from './projectStartRoute.js';
