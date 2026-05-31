'use client';

import { useEffect } from 'react';
import {
    getWorkspaceDefinition,
    getWorkspaceRegistry,
    resolveWorkspaceContext,
    resolveProjectPerspectiveContext,
    hasProjectPerspective,
} from '@/platform/workspaces';
import { WorkspaceRoot } from '@/ui/workspace/root/WorkspaceRoot.jsx';

export function ModeLoader({ mode, queryMode = null, queryPerspective = null, queryEntry = null }) {
    const requestedPerspectiveId = (queryPerspective || mode || '').toLowerCase();
    const requestedEntryId = (queryEntry || queryMode || '').toLowerCase();
    const projectPerspectiveContext = hasProjectPerspective(requestedPerspectiveId)
        ? resolveProjectPerspectiveContext({
              perspectiveId: requestedPerspectiveId,
              entryId: requestedEntryId,
          })
        : null;
    const context = projectPerspectiveContext
        ? resolveWorkspaceContext({
              workspaceId: projectPerspectiveContext.workspaceId,
              modeId: projectPerspectiveContext.modeId,
          })
        : resolveWorkspaceContext({
              workspace: (mode || '').toLowerCase(),
              mode: (queryMode || '').toLowerCase(),
          });

    const workspace = getWorkspaceDefinition(context.workspaceId);
    const workspaceRegistry = getWorkspaceRegistry();

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log(
                '[ModeLoader]',
                'mode:',
                mode,
                'queryMode:',
                queryMode,
                'queryPerspective:',
                queryPerspective,
                'queryEntry:',
                queryEntry,
                'projectPerspectiveContext:',
                projectPerspectiveContext,
                'context:',
                context,
                'workspace:',
                workspace?.id,
            );
        }
    }, [workspace, context, mode, queryMode, queryPerspective, queryEntry, projectPerspectiveContext]);

    if (!workspace) {
        const available = Object.keys(workspaceRegistry);
        return (
            <div style={{ padding: 16, fontSize: 14 }}>
                <div style={{ marginBottom: 8 }}>Unknown workspace: {mode}</div>
                <div>Available modes: {available.join(', ')}</div>
            </div>
        );
    }

    return (
        <WorkspaceRoot
            modeId={context.modeId ?? workspace.defaultMode ?? workspace.id}
            workspaceId={context.workspaceId ?? workspace.id}
            profile={workspace.profile ?? 'design'}
            workspace={workspace}
            workspaceContext={context}
            shellProps={{
                projectPerspectiveContext,
            }}
        />
    );
}
