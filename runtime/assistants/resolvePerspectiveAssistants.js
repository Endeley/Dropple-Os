import { resolveProjectPerspectiveContext } from '@/platform/workspaces/projectPerspectiveRouter.js';
import {
    getAssistantCapabilityById,
    listAssistantCapabilitiesForPerspective,
} from '@/runtime/assistants/registry.js';

function normalizeString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function resolvePerspectiveAssistants({ perspectiveId, entryId, preferredAssistantId = null } = {}) {
    const perspectiveContext = resolveProjectPerspectiveContext({ perspectiveId, entryId });
    const assistants = listAssistantCapabilitiesForPerspective(perspectiveContext.perspectiveId);

    const preferred = normalizeString(preferredAssistantId);
    const preferredAssistant =
        preferred && getAssistantCapabilityById(preferred)?.perspectiveId === perspectiveContext.perspectiveId
            ? getAssistantCapabilityById(preferred)
            : null;

    const activeAssistant = preferredAssistant ?? assistants[0] ?? null;

    return Object.freeze({
        perspectiveId: perspectiveContext.perspectiveId,
        perspectiveLabel: perspectiveContext.perspectiveLabel,
        entryId: perspectiveContext.entryId,
        workspaceId: perspectiveContext.workspaceId,
        modeId: perspectiveContext.modeId,
        overlayId: perspectiveContext.overlayId,
        assistants,
        activeAssistantId: activeAssistant?.id ?? null,
    });
}
