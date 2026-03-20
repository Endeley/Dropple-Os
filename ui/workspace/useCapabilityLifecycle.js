'use client';

import { useEffect, useRef } from 'react';
import { CAPABILITY_REGISTRY } from './capabilities/capabilityRegistry.js';
import { createCapabilityContext } from '@/runtime/workspaces/index.js';
import {
    cleanupCapabilityLifecycle,
    reconcileCapabilityLifecycle,
} from './capabilities/reconcileCapabilityLifecycle.js';

export function useCapabilityLifecycle({
    capabilities,
    dispatcher,
    workspace,
    mode,
}) {
    const mountedRef = useRef(new Set());
    const contextRef = useRef(null);

    useEffect(() => {
        const context = createCapabilityContext({
            dispatcher,
            workspace,
            mode,
        });

        contextRef.current = context;
        mountedRef.current = reconcileCapabilityLifecycle({
            mountedCapabilities: mountedRef.current,
            capabilities,
            registry: CAPABILITY_REGISTRY,
            context,
        });
    }, [capabilities, dispatcher, workspace, mode]);

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
