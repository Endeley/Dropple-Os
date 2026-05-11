'use client';

import { useEffect, useMemo, useRef } from 'react';
import { createInterpretedToolProviderRuntimeBridge } from '@/ui/bridges/interpretedToolProviderRuntimeBridge.js';
import { getVisibleToolsForWorkspace } from '@/ui/tools/toolDefinitions.js';
import { CAPABILITY_REGISTRY } from '@/ui/workspace/capabilities/capabilityRegistry.js';

function resolveInterpretedProviders(capabilities, registry) {
    if (!Array.isArray(capabilities)) return [];

    return capabilities
        .map((capability) => {
            const interpretedTools = registry?.[capability]?.interpretedTools ?? null;
            if (!Array.isArray(interpretedTools) || interpretedTools.length === 0) return null;

            return {
                source: `capability.${capability}`,
                specs: interpretedTools,
            };
        })
        .filter(Boolean);
}

export function useInterpretedToolProviderLifecycle({
    capabilities,
    emit,
    workspace,
    mode,
    overlayId,
} = {}) {
    const controllerRef = useRef(null);

    if (!controllerRef.current) {
        controllerRef.current = createInterpretedToolProviderRuntimeBridge({ emit });
    }

    const providers = useMemo(
        () => resolveInterpretedProviders(capabilities, CAPABILITY_REGISTRY),
        [capabilities],
    );
    const allowedToolIds = useMemo(
        () =>
            getVisibleToolsForWorkspace({
                workspaceId: workspace,
                modeId: mode,
                overlayId,
            }).map((tool) => tool.id),
        [mode, overlayId, workspace],
    );

    useEffect(() => {
        controllerRef.current?.sync({
            providers,
            allowedToolIds,
        });
    }, [allowedToolIds, providers]);

    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
        };
    }, []);
}
