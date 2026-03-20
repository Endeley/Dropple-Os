'use client';

import CanvasRoot from '@/ui/canvas/CanvasRoot.jsx';
import { Controls } from '@/ui/Controls.jsx';

import { isMediaWorkspaceId } from '@/platform/workspaces/mediaWorkspace.js';
import { MediaWorkspaceShell } from '@/ui/workspace/media/MediaWorkspaceShell.jsx';
import { ModeSwitcher } from '@/ui/workspace/shared/ModeSwitcher.jsx';
import { WorkspaceSwitcher } from '@/ui/workspace/shared/WorkspaceSwitcher.jsx';
import { useWorkspaceNavigation } from '@/ui/workspace/shared/useWorkspaceNavigation.js';

// 🔹 UX Workspace (read-only UI)
import { UXWorkspaceShell } from '@/ui/workspace/ux/UXWorkspaceShell';
import { UIUXAuthoringShell } from '@/ui/workspace/ux/UIUXAuthoringShell.jsx';

/**
 * The authoritative editor surface for a workspace mode.
 *
 * IMPORTANT:
 * - This file is UI composition ONLY
 * - No dispatcher logic
 * - No execution authority
 *
 * UX Workspace is mounted here when:
 *   workspace.profile === 'ux-validation'
 */
export function WorkspaceShell({ workspace, modeId = null, workspaceContext = null }) {
    const capabilities = workspace.capabilities || {};
    const isUX =
        workspace.profile === 'ux-validation' || workspace.profile === 'uiux-authoring';
    const { goToMode, goToWorkspace } = useWorkspaceNavigation();
    const activeWorkspace = workspaceContext?.workspace ?? 'design';
    const activeMode = workspaceContext?.mode ?? modeId ?? workspace.id;

    if (isMediaWorkspaceId(workspace.id)) {
        return (
            <MediaWorkspaceShell
                workspace={workspace}
                modeId={activeMode}
                workspaceContext={workspaceContext}
            />
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* ===== Header / Mode Bar ===== */}
            <header
                style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    background: '#f8fafc',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <strong style={{ fontSize: 14 }}>
                        {workspaceContext?.label ?? workspace.label}
                    </strong>
                    <WorkspaceSwitcher
                        activeWorkspace={activeWorkspace}
                        onChange={goToWorkspace}
                    />
                    <ModeSwitcher
                        workspace={activeWorkspace}
                        activeMode={activeMode}
                        onChange={(nextMode) => goToMode(activeWorkspace, nextMode)}
                    />
                </div>

                {/* Optional workspace nav (if defined) */}
                {workspace.routes && (
                    <nav style={{ display: 'flex', gap: 6 }}>
                        {Object.entries(workspace.routes).map(([routeKey, route]) => (
                            <a
                                key={routeKey}
                                href={route.href}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    background: 'rgba(59,130,246,0.1)',
                                    color: '#2563eb',
                                    textDecoration: 'none',
                                    fontSize: 12,
                                }}>
                                {route.label}
                            </a>
                        ))}
                    </nav>
                )}
            </header>

            {/* ===== Main Workspace Area ===== */}
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                {isUX ? (
                    /* ────────────────────────────────────────────── */
                    /* UX WORKSPACE                                   */
                    /* ────────────────────────────────────────────── */
                    workspace.profile === 'uiux-authoring' ? (
                        <UIUXAuthoringShell profile={workspace.profile} />
                    ) : (
                        <UXWorkspaceShell profile={workspace.profile} />
                    )
                ) : (
                    /* ────────────────────────────────────────────── */
                    /* EDITOR WORKSPACE                               */
                    /* ────────────────────────────────────────────── */
                    <>
                        {/* Left sidebar (layers, etc.) */}
                        {capabilities.layers && (
                            <aside
                                style={{
                                    width: 240,
                                    borderRight: '1px solid #e5e7eb',
                                    background: '#ffffff',
                                }}>
                                {/* Layers panel placeholder */}
                            </aside>
                        )}

                        {/* Canvas */}
                        <main style={{ flex: 1, position: 'relative' }}>
                            <CanvasRoot />
                            <Controls profile={workspace.profile} />
                        </main>

                        {/* Right sidebar (properties) */}
                        {capabilities.properties && (
                            <aside
                                style={{
                                    width: 300,
                                    borderLeft: '1px solid #e5e7eb',
                                    background: '#ffffff',
                                }}>
                                {/* Properties panel placeholder */}
                            </aside>
                        )}
                    </>
                )}
            </div>

            {/* ===== Timeline ===== */}
            {!isUX && capabilities.timeline && (
                <footer
                    style={{
                        height: 180,
                        borderTop: '1px solid #e5e7eb',
                        background: '#f8fafc',
                    }}>
                    {/* Timeline panel placeholder */}
                </footer>
            )}
        </div>
    );
}
