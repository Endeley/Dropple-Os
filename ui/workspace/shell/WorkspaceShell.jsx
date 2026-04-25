'use client';

import { isMediaWorkspaceId } from '@/platform/workspaces/mediaWorkspace.js';

import { MediaWorkspaceShell } from '@/ui/workspace/media/MediaWorkspaceShell.jsx';
import { EditorWorkspaceShell } from '@/ui/workspace/editor/EditorWorkspaceShell.jsx';
import { UIUXAuthoringShell } from '@/ui/workspace/uiux/UIUXAuthoringShell.jsx';
import { UXWorkspaceShell } from '@/ui/workspace/ux/UXWorkspaceShell';

/**
 * Authoritative workspace shell router.
 *
 * Constitutional law:
 * - Composition only
 * - No dispatcher logic
 * - No execution authority
 * - One shell decision point
 *
 * Routing law:
 * media modes       -> MediaWorkspaceShell
 * ux-validation     -> UXWorkspaceShell
 * uiux mode         -> UIUXAuthoringShell
 * all other modes   -> EditorWorkspaceShell
 */
export function WorkspaceShell({ workspace, modeId = null, workspaceContext = null }) {
    const activeMode = workspaceContext?.mode || modeId;
    const isUXValidation = workspace.profile === 'ux-validation';
    const isUIUX = activeMode === 'uiux';

    /**
     * Media workspaces own their own shell authority.
     */
    if (isMediaWorkspaceId(workspace.id)) {
        return <MediaWorkspaceShell workspace={workspace} modeId={activeMode} workspaceContext={workspaceContext} />;
    }

    /**
     * UX validation is a distinct read-only shell.
     */
    if (isUXValidation) {
        return <UXWorkspaceShell workspace={workspace} modeId={activeMode} workspaceContext={workspaceContext} profile={workspace.profile} />;
    }

    /**
     * UIUX owns a dedicated product shell.
     * Do not route uiux through generic editor shell.
     */
    if (isUIUX) {
        return <UIUXAuthoringShell workspace={workspace} modeId={activeMode} workspaceContext={workspaceContext} />;
    }

    /**
     * Generic fallback for remaining non-media,
     * non-uiux authoring modes.
     */
    return <EditorWorkspaceShell workspace={workspace} modeId={activeMode} workspaceContext={workspaceContext} />;
}
