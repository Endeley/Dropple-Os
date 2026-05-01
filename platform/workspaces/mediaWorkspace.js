import { getWorkspaceDefinition } from './workspaceRegistry.js';

export const MEDIA_WORKSPACE_ID = 'media';
export const MEDIA_DEFAULT_MODE = 'animation';
export const MEDIA_MODE_IDS = Object.freeze(['animation', 'video', 'audio']);
const MEDIA_MODE_COMPATIBILITY_ALIASES = Object.freeze({
    podcast: 'audio',
});

const MEDIA_MODE_LABELS = Object.freeze({
    animation: 'Animation',
    video: 'Video',
    audio: 'Audio',
});

export function isMediaWorkspaceId(workspaceId) {
    return (
        workspaceId === MEDIA_WORKSPACE_ID ||
        MEDIA_MODE_IDS.includes(workspaceId) ||
        Object.hasOwn(MEDIA_MODE_COMPATIBILITY_ALIASES, workspaceId)
    );
}

export function resolveMediaWorkspaceMode(workspaceId) {
    if (Object.hasOwn(MEDIA_MODE_COMPATIBILITY_ALIASES, workspaceId)) {
        return MEDIA_MODE_COMPATIBILITY_ALIASES[workspaceId];
    }

    if (MEDIA_MODE_IDS.includes(workspaceId)) return workspaceId;
    return MEDIA_DEFAULT_MODE;
}

export function listMediaWorkspaceModes() {
    return MEDIA_MODE_IDS.map((id) => ({
        id,
        label: MEDIA_MODE_LABELS[id] ?? id,
    }));
}

export function getMediaWorkspaceDefinition() {
    return getWorkspaceDefinition(MEDIA_WORKSPACE_ID);
}
