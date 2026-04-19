'use client';

import { useEffect, useRef } from 'react';
import { CAPABILITY_REGISTRY } from './capabilities/capabilityRegistry.js';
import { createCapabilityContext } from '@/runtime/workspaces/index.js';
import { cleanupCapabilityLifecycle, reconcileCapabilityLifecycle } from './capabilities/reconcileCapabilityLifecycle.js';

export function useCapabilityLifecycle({ capabilities, emit, workspace, mode }) {
    const mountedRef = useRef(new Set());
    const contextRef = useRef(
        createCapabilityContext({
            emit,
            workspace,
            mode,
        }),
    );

    useEffect(() => {
        const context = createCapabilityContext({
            emit,
            workspace,
            mode,
        });

        contextRef.current = context;
        mountedRef.current = reconcileCapabilityLifecycle({
            mountedCapabilities: mountedRef.current,
            capabilities: Array.isArray(capabilities) ? capabilities : [],
            registry: CAPABILITY_REGISTRY,
            context,
        });
    }, [capabilities, emit, workspace, mode]);

    useEffect(() => {
        return () => {
            mountedRef.current = cleanupCapabilityLifecycle({
                mountedCapabilities: mountedRef.current,
                registry: CAPABILITY_REGISTRY,
                context: contextRef.current,
            });
        };
    }, []);
}
