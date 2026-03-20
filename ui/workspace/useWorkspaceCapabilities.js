'use client';

import { useMemo } from 'react';
import { resolveWorkspaceCapabilities } from '@/runtime/workspaces/index.js';
import { CAPABILITY_REGISTRY } from './capabilities/capabilityRegistry.js';
import { resolveCapabilityComponents } from './capabilities/resolveCapabilityComponents.js';

const EMPTY_COMPONENTS = Object.freeze({
    capabilities: Object.freeze([]),
    surfacePanels: Object.freeze([]),
    overlays: Object.freeze([]),
});

export function useWorkspaceCapabilities({ workspace, mode } = {}) {
    return useMemo(() => {
        const capabilities = resolveWorkspaceCapabilities({ workspace, mode });
        if (capabilities.length === 0) {
            return EMPTY_COMPONENTS;
        }
        const { surfacePanels, overlays } = resolveCapabilityComponents(
            capabilities,
            CAPABILITY_REGISTRY,
        );

        return {
            capabilities,
            surfacePanels,
            overlays,
        };
    }, [mode, workspace]);
}
