'use client';

import { useEffect, useState } from 'react';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { DispatcherContext } from '@/ui/workspace/root/DispatcherProvider/DispatcherContext.jsx';
import { setDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';

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
    const [dispatcher] = useState(() =>
        createEventDispatcher({
            workspaceId,
            branchId,
            profile,
            uxEnforcementTier,
        })
    );

    useEffect(() => {
        setDispatcher(dispatcher);
        return () => {
            setDispatcher(null);
        };
    }, [dispatcher]);

    return <DispatcherContext.Provider value={dispatcher}>{children}</DispatcherContext.Provider>;
}
