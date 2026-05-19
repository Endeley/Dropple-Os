'use client';

import { isMediaWorkspaceId } from '@/platform/workspaces/mediaWorkspace.js';

import { MediaWorkspaceShell } from '@/ui/workspace/media/MediaWorkspaceShell.jsx';
import { EditorWorkspaceShell } from '@/ui/workspace/editor/EditorWorkspaceShell.jsx';
import { UIUXAuthoringShell } from '@/ui/workspace/uiux/UIUXAuthoringShell.jsx';
import { UXWorkspaceShell } from '@/ui/workspace/ux/UXWorkspaceShell';
import { OsWorkspaceSurfaceShell } from '@/ui/workspace/shell/OsWorkspaceSurfaceShell.jsx';

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
export function WorkspaceShell({ workspace, modeId = null, workspaceContext = null, ...shellProps }) {
    const activeMode = workspaceContext?.mode || modeId;
    const isUXValidation = workspace.profile === 'ux-validation';
    const isUIUX = activeMode === 'uiux';
    let innerShell = null;

    /**
     * Media workspaces own their own shell authority.
     */
    if (isMediaWorkspaceId(workspace.id)) {
        innerShell = <MediaWorkspaceShell workspace={workspace} modeId={activeMode} workspaceContext={workspaceContext} {...shellProps} />;
    } else if (isUXValidation) {
        /**
         * UX validation is a distinct read-only shell.
         */
        innerShell = <UXWorkspaceShell workspace={workspace} modeId={activeMode} workspaceContext={workspaceContext} profile={workspace.profile} {...shellProps} />;
    } else if (isUIUX) {
        /**
         * UIUX owns a dedicated product shell.
         * Do not route uiux through generic editor shell.
         */
        innerShell = <UIUXAuthoringShell workspace={workspace} modeId={activeMode} workspaceContext={workspaceContext} {...shellProps} />;
    } else {
        /**
         * Generic fallback for remaining non-media,
         * non-uiux authoring modes.
         */
        innerShell = <EditorWorkspaceShell workspace={workspace} modeId={activeMode} workspaceContext={workspaceContext} {...shellProps} />;
    }

    return (
        <>
            {innerShell}
            <OsWorkspaceSurfaceShell />
        </>
    );
}
