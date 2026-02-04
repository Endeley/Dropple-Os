'use client';

import { UXWorkspaceShell } from '../ux/UXWorkspaceShell';
import { UIUXAuthoringShell } from '../ux/UIUXAuthoringShell.jsx';
import { EditorWorkspaceShell } from '../editor/EditorWorkspaceShell';

/**
 * WorkspaceShell
 *
 * Router-only shell.
 * This file MUST NOT contain React hooks.
 *
 * Responsibilities:
 * - Route to UXWorkspaceShell for `uiux`
 * - Route to EditorWorkspaceShell for all other modes
 *
 * This guarantees:
 * - Hook order correctness
 * - UX isolation
 * - Phase A architectural lock
 */
export function WorkspaceShell(props) {
    const { modeId } = props;
    console.log('[WorkspaceShell] modeId =', modeId);

    if (modeId === 'uiux') {
        const profile = props.profile ?? 'uiux-authoring';
        return profile === 'uiux-authoring' ? (
            <UIUXAuthoringShell modeId='uiux' events={props.initialEvents ?? []} cursor={{ index: props.initialCursorIndex ?? -1 }} profile={profile} />
        ) : (
            <UXWorkspaceShell modeId='uiux' events={props.initialEvents ?? []} cursor={{ index: props.initialCursorIndex ?? -1 }} profile={profile} />
        );
    }

    return <EditorWorkspaceShell {...props} />;
}
