import { getAllCapabilities, getCapability } from './capabilityRegistry.js';
import { resolveWorkspaceCapabilities } from './capabilityResolver.js';

function normalizeIds(activeCapabilityIds = []) {
    return [...new Set(activeCapabilityIds.filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b)));
}

export function createCapabilityContext({ activeCapabilityIds = [], resolveActiveCapabilityIds = null } = {}) {
    function getActiveIds() {
        const ids =
            typeof resolveActiveCapabilityIds === 'function'
                ? resolveActiveCapabilityIds()
                : activeCapabilityIds;

        return normalizeIds(ids);
    }

    return Object.freeze({
        has(capabilityId) {
            return new Set(getActiveIds()).has(capabilityId);
        },

        get(capabilityId) {
            if (!new Set(getActiveIds()).has(capabilityId)) {
                throw new Error(`Capability not enabled: ${capabilityId}`);
            }

            const capability = getCapability(capabilityId);
            if (!capability) {
                throw new Error(`Capability not registered: ${capabilityId}`);
            }

            return capability;
        },

        list() {
            return getActiveIds();
        },
    });
}

export function createWorkspaceCapabilityContext(workspace) {
    const capabilities = resolveWorkspaceCapabilities(workspace);
    return createCapabilityContext({
        activeCapabilityIds: capabilities.map((capability) => capability.id),
    });
}

export function createGlobalCapabilityContext() {
    return createCapabilityContext({
        resolveActiveCapabilityIds: () =>
            getAllCapabilities().map((capability) => capability.id),
    });
}
