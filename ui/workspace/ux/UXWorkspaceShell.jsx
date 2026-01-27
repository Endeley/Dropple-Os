'use client';
import CanvasRoot from '@/ui/canvas/CanvasRoot.jsx';
import { UXInspectorPanel } from '@/ui/workspace/ux/UXInspectorPanel.jsx';

/**
 * UXWorkspaceShell
 *
 * PURPOSE
 * -------
 * Read-only UX / UI inspection surface.
 *
 * This shell must NEVER:
 * - emit events
 * - mutate state
 * - mount editor UI
 * - register input handlers
 * - perform persistence
 *
 * It exists solely to:
 * - observe events
 * - reconstruct state
 * - present UX-specific insights
 *
 * Phase A:
 * - Inspection only
 *
 * Phase B (future):
 * - Simulation / diff (projection-only, no authority)
 */

/* ──────────────────────────────────────────────────────────────── */
/* 🚫 HARD GUARDRAILS — DO NOT REMOVE                                */
/* ──────────────────────────────────────────────────────────────── */

/**
 * DO NOT IMPORT:
 * - WorkspaceLayout
 * - Toolbar / PropertyBar / TimelineBar
 * - emit / MessageBus / canvasBus
 * - persistence, import, export modules
 * - keyboard / interaction hooks
 * - editor tools or creation resolvers
 *
 * If you think you need one of these, STOP.
 * The architecture is being violated.
 */

/* ──────────────────────────────────────────────────────────────── */
/* ✅ ALLOWED (WHEN IMPLEMENTATION BEGINS)                           */
/* ──────────────────────────────────────────────────────────────── */

/**
 * Allowed imports (Phase A):
 * - getDesignStateAtCursor
 * - read-only dispatcher selectors
 * - pure render helpers
 * - UX-only panels/components
 */

/* ──────────────────────────────────────────────────────────────── */
/* 🧩 PROPS CONTRACT (LOCKED)                                        */
/* ──────────────────────────────────────────────────────────────── */

/**
 * Props (do not extend without architectural review):
 *
 * - modeId: 'uiux'
 * - events: ReadonlyArray<WorkspaceEvent>
 * - cursor: { index: number }
 * - dispatcher: read-only access only
 * - profile: 'ux-validation'
 */

export function UXWorkspaceShell(props) {
    /**
     * Intentionally empty.
     *
     * This component will be implemented only after:
     * - branch routing is wired in WorkspaceShell
     * - read-only guarantees are enforced
     * - UX panel inventory is finalized
     */

    return (
        <div
            data-workspace='uiux'
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
            }}>
            {/* Main read-only canvas area */}
            <div style={{ flex: 1, position: 'relative' }}>
                <CanvasRoot workspaceId='uiux' />
            </div>

            {/* Right-side UX Inspector */}
            <div style={{ width: 360, borderLeft: '1px solid #eee' }}>
                <UXInspectorPanel
                    events={props.events}
                    cursor={props.cursor}
                    selection={props.selection}
                />
            </div>
        </div>
    );
}
