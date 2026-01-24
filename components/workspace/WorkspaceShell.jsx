'use client';

import { UXWorkspaceShell } from './UXWorkspaceShell';
import { EditorWorkspaceShell } from './EditorWorkspaceShell';

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

    if (modeId === 'uiux') {
        return <UXWorkspaceShell modeId='uiux' events={props.initialEvents ?? []} cursor={{ index: props.initialCursorIndex ?? -1 }} profile='ux-validation' />;
    }

    return <EditorWorkspaceShell {...props} />;
}
