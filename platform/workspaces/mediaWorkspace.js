import { getWorkspaceDefinition } from './workspaceRegistry.js';

export const MEDIA_WORKSPACE_ID = 'media';
export const MEDIA_DEFAULT_MODE = 'animation';
export const MEDIA_MODE_IDS = Object.freeze(['animation', 'video', 'podcast']);

const MEDIA_MODE_LABELS = Object.freeze({
    animation: 'Animation',
    video: 'Video',
    podcast: 'Podcast',
});

export function isMediaWorkspaceId(workspaceId) {
    return workspaceId === MEDIA_WORKSPACE_ID || MEDIA_MODE_IDS.includes(workspaceId);
}

export function resolveMediaWorkspaceMode(workspaceId) {
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
