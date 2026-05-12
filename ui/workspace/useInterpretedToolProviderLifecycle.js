'use client';

import { useEffect, useMemo, useRef } from 'react';
import { createInterpretedToolProviderRuntimeBridge } from '@/ui/bridges/interpretedToolProviderRuntimeBridge.js';
import { getVisibleToolsForWorkspace } from '@/ui/tools/toolDefinitions.js';
import { CAPABILITY_REGISTRY } from '@/ui/workspace/capabilities/capabilityRegistry.js';

function normalizeToolIds(values) {
    if (!Array.isArray(values)) return [];

    return Array.from(
        new Set(
            values
                .filter((value) => typeof value === 'string')
                .map((value) => value.trim())
                .filter(Boolean),
        ),
    ).sort((left, right) => left.localeCompare(right));
}

function resolveInterpretedProviders(capabilities, registry) {
    if (!Array.isArray(capabilities)) return [];

    return capabilities
        .map((capability) => {
            const interpretedTools = registry?.[capability]?.interpretedTools ?? null;
            if (!Array.isArray(interpretedTools) || interpretedTools.length === 0) return null;

            return {
                source: `capability.${capability}`,
                specs: interpretedTools,
                priority: Number.isFinite(registry?.[capability]?.interpretedToolPriority)
                    ? registry[capability].interpretedToolPriority
                    : 0,
            };
        })
        .filter(Boolean);
}

function resolveAllowedToolIds({ capabilities, workspace, mode, overlayId, registry }) {
    const workspaceToolIds = getVisibleToolsForWorkspace({
        workspaceId: workspace,
        modeId: mode,
        overlayId,
    }).map((tool) => tool.id);

    const capabilityToolIds = Array.isArray(capabilities)
        ? capabilities.flatMap((capability) => registry?.[capability]?.tools ?? [])
        : [];

    return normalizeToolIds([...workspaceToolIds, ...capabilityToolIds]);
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
            resolveAllowedToolIds({
                capabilities,
                workspace,
                mode,
                overlayId,
                registry: CAPABILITY_REGISTRY,
            }),
        [capabilities, mode, overlayId, workspace],
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
