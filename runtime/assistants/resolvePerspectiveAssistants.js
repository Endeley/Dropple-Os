import { resolveRuntimeProjectPerspectiveContext } from '@/runtime/assistants/projectPerspectiveContext.js';
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

function inferDefaultAssistantForContext(perspectiveContext) {
    if (!perspectiveContext || typeof perspectiveContext !== 'object') return null;

    if (perspectiveContext.perspectiveId === 'create') {
        if (perspectiveContext.workspaceId === 'media') return 'assistant.media';
        return 'assistant.design';
    }

    return null;
}

export function resolvePerspectiveAssistants({ perspectiveId, entryId, preferredAssistantId = null } = {}) {
    const perspectiveContext = resolveRuntimeProjectPerspectiveContext({ perspectiveId, entryId });
    const adapter = resolvePerspectiveAssistantAdapter({
        perspectiveId: perspectiveContext.perspectiveId,
        entryId: perspectiveContext.entryId,
    });
    const assistants = listAssistantCapabilitiesForPerspective(perspectiveContext.perspectiveId);

    const preferred = normalizeString(preferredAssistantId);
    const defaultAssistantId = inferDefaultAssistantForContext(perspectiveContext);
    const requestedAssistantId = preferred ?? defaultAssistantId;
    const preferredAssistant =
        requestedAssistantId &&
        getAssistantCapabilityById(requestedAssistantId)?.perspectiveId === perspectiveContext.perspectiveId
            ? getAssistantCapabilityById(requestedAssistantId)
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
