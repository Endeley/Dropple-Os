'use client';

import { createContext, useContext, useMemo } from 'react';
import { createWorkspaceSession } from './createWorkspaceSession.js';

const WorkspaceSessionContext = createContext(
    Object.freeze({
        workspaceId: null,
        modeId: null,
        launchContext: null,
        language: null,
        category: null,
        blueprint: null,
        template: null,
        grammar: null,
        certification: null,
        hasLaunchContext: false,
    }),
);

export function WorkspaceSessionProvider({
    launchContext = null,
    workspaceId = null,
    modeId = null,
    children = null,
}) {
    const value = useMemo(
        () =>
            createWorkspaceSession({
                launchContext,
                workspaceId,
                modeId,
            }),
        [launchContext, workspaceId, modeId],
    );

    return <WorkspaceSessionContext.Provider value={value}>{children}</WorkspaceSessionContext.Provider>;
}

export function useWorkspaceSession() {
    return useContext(WorkspaceSessionContext);
}
