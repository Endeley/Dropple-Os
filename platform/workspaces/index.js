export {
    getWorkspaceDefinition,
    getWorkspaceRegistry,
    hasWorkspaceDefinition,
    listWorkspaceDefinitions,
    resolveWorkspaceId,
} from './workspaceRegistry.js';
export { CANONICAL_WORKSPACES } from './canonicalRegistry.js';
export { LEGACY_WORKSPACE_MAP } from './legacyMapping.js';
export { resolveWorkspaceContext } from './resolveWorkspaceContext.js';

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
