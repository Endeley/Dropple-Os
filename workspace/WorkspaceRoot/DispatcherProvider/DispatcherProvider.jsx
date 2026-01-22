'use client';

import { useEffect, useRef, useState } from 'react';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { DispatcherContext } from './DispatcherContext.jsx';
import { attachDispatcher } from '@/ui/interaction/dispatcher.js';

/**
 * DispatcherProvider
 *
 * SINGLE AUTHORITY:
 * - Creates exactly ONE dispatcher instance per mounted workspace.
 * - Provides it via React context to UI/Canvas/Sessions/Bridges.
 * - (Optional) Attaches it to the UI dispatcher adapter for legacy callsites.
 */
export function DispatcherProvider({
    workspaceId = null,
    branchId = 'main',
    profile = 'design',
    uxEnforcementTier = 2,
    children,
}) {
    const dispatcherRef = useRef(null);
    const [dispatcher] = useState(() => {
        if (!dispatcherRef.current) {
            dispatcherRef.current = createEventDispatcher({
                workspaceId,
                branchId,
                profile,
                uxEnforcementTier,
            });
        }
        return dispatcherRef.current;
    });

    useEffect(() => {
        try {
            attachDispatcher(dispatcherRef.current);
        } catch {
            // If attachDispatcher doesn't exist (or you removed it), ignore.
            // The context is the source of truth going forward.
        }
    }, [workspaceId, branchId]);

    return <DispatcherContext.Provider value={dispatcher}>{children}</DispatcherContext.Provider>;
}
