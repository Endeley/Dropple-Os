'use client';

import { EditorWorkspaceShell } from '@/ui/workspace/editor/EditorWorkspaceShell.jsx';
import {
    MEDIA_WORKSPACE_ID,
    resolveMediaWorkspaceMode,
} from '@/platform/workspaces';
import { getMediaModeConfig } from './mediaModes.js';
import { RigControllerOverlay } from '@/ui/rigging/RigControllerOverlay.jsx';
import { MediaBrowserPanel } from './shared/MediaBrowserPanel.jsx';
import { MediaInspectorPanel } from './shared/MediaInspectorPanel.jsx';
import { MediaTimelinePanel } from './shared/MediaTimelinePanel.jsx';
import { MediaTransportBar } from './shared/MediaTransportBar.jsx';
import { ModeSwitcher } from '@/ui/workspace/shared/ModeSwitcher.jsx';
import { WorkspaceSwitcher } from '@/ui/workspace/shared/WorkspaceSwitcher.jsx';
import { useWorkspaceNavigation } from '@/ui/workspace/shared/useWorkspaceNavigation.js';
import { GraphCanvas } from './animation/GraphCanvas.jsx';

export function MediaWorkspaceShell(props) {
    const requestedMode = props.modeId ?? props.workspace?.id ?? MEDIA_WORKSPACE_ID;
    const activeMode = resolveMediaWorkspaceMode(requestedMode);
    const modeConfig = getMediaModeConfig(activeMode);
    const workspaceContext = props.workspaceContext ?? null;
    const activeWorkspace = workspaceContext?.workspace ?? MEDIA_WORKSPACE_ID;
    const { goToMode, goToWorkspace } = useWorkspaceNavigation();

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div
                style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 1100,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 8,
                }}>
                <div
                    style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        border: '1px solid rgba(148, 163, 184, 0.35)',
                        background: 'rgba(15, 23, 42, 0.84)',
                        color: '#e2e8f0',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(10px)',
                    }}>
                    {`${workspaceContext?.label ?? 'Media'} Workspace`}
                </div>
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
            <div
                style={{
                    position: 'absolute',
                    top: 72,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1040,
                    width: 520,
                    height: 280,
                    pointerEvents: 'none',
                }}>
                {activeMode === 'animation' ? (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
                        <GraphCanvas />
                    </div>
                ) : null}
            </div>
            <div
                style={{
                    position: 'absolute',
                    top: 72,
                    left: 16,
                    zIndex: 1050,
                    width: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                }}>
                <MediaBrowserPanel mode={modeConfig} />
            </div>
            <div
                style={{
                    position: 'absolute',
                    top: 72,
                    right: 16,
                    zIndex: 1050,
                    width: 280,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                }}>
                <MediaInspectorPanel mode={modeConfig} />
            </div>
            <div
                style={{
                    position: 'absolute',
                    left: 16,
                    right: 16,
                    bottom: 16,
                    zIndex: 1050,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                }}>
                <MediaTransportBar mode={modeConfig} />
                <MediaTimelinePanel mode={modeConfig} />
            </div>
            {activeMode === 'animation' ? <RigControllerOverlay /> : null}
            <EditorWorkspaceShell {...props} modeId={activeMode} />
        </div>
    );
}
