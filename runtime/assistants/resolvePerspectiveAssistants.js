import { resolveProjectPerspectiveContext } from '@/platform/workspaces/projectPerspectiveRouter.js';
import {
    getAssistantCapabilityById,
    listAssistantCapabilitiesForPerspective,
} from '@/runtime/assistants/registry.js';
import { resolvePerspectiveAssistantAdapter } from '@/runtime/assistants/perspectiveAdapters.js';

function normalizeString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function resolvePerspectiveAssistants({ perspectiveId, entryId, preferredAssistantId = null } = {}) {
    const perspectiveContext = resolveProjectPerspectiveContext({ perspectiveId, entryId });
    const adapter = resolvePerspectiveAssistantAdapter({
        perspectiveId: perspectiveContext.perspectiveId,
        entryId: perspectiveContext.entryId,
    });
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
        adapter,
        assistants,
        activeAssistantId: activeAssistant?.id ?? null,
    });
}
