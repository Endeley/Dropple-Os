'use client';

import { DispatcherProvider } from '@/runtime/boundary/DispatcherProvider.jsx';
import { WorkspaceUIRoot } from './DispatcherProvider/UI/WorkspaceUIRoot.jsx';
import { WorkspaceSessionsRoot } from './DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx';
import { WorkspaceBridgesRoot } from './DispatcherProvider/Bridges/WorkspaceBridgesRoot.jsx';
import { SelectionProvider } from '@/ui/workspace/shared/SelectionContext';
import { WorkspaceShell } from '@/ui/workspace/shell/WorkspaceShell.jsx';
import { RuntimeDispatchRelay } from '@/runtime/boundary/RuntimeDispatchRelay.jsx';
import { WorkspaceSessionProvider } from '@/ui/workspace/session/WorkspaceSessionContext.jsx';

/**
 * WorkspaceRoot
 *
 * Phase 1 — UX Mode identity only
 * - Renders a persistent UX Mode badge when enabled
 * - No behavior changes
 * - No control gating
 */
export function WorkspaceRoot({
    workspaceId = null,
    branchId = 'main',
    profile = 'design', // expected: 'design' | 'ux-validation'
    modeId = null,
    uxEnforcementTier = 2,
    workspace = null,
    workspaceContext = null,
    shellProps = null,
    children = null,
}) {
    const isUXMode = profile === 'ux-validation';
    const workspaceRootKey = `${workspaceId ?? 'workspace'}:${branchId}:${profile}:${modeId ?? workspace?.id ?? 'mode'}`;
    const hasExplicitContent = children != null || workspace != null;
    const workspaceLaunchContext = shellProps?.initialWorkspaceLaunchContext ?? null;

    if (!hasExplicitContent) {
        throw new Error('[WorkspaceRoot] expected either workspace or children');
    }

    return (
        <DispatcherProvider
            key={workspaceRootKey}
            workspaceId={workspaceId}
            branchId={branchId}
            profile={profile}
            uxEnforcementTier={uxEnforcementTier}>
            <WorkspaceSessionProvider
                launchContext={workspaceLaunchContext}
                workspaceId={workspaceId ?? workspaceContext?.workspaceId ?? null}
                modeId={modeId ?? workspaceContext?.modeId ?? workspace?.id ?? null}>
                <SelectionProvider>
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                        }}>
                        {isUXMode && (
                            <div
                                aria-label='UX Mode badge'
                                style={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                    zIndex: 1000,

                                    background: '#FFF4E5',
                                    color: '#9A5B13',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: 6,

                                    padding: '4px 8px',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: '0.02em',
                                }}>
                                UX MODE — Validation Surface
                            </div>
                        )}
                        {children ?? (
                            <RuntimeDispatchRelay>
                                {(dispatcher) => (
                                    <>
                                        <WorkspaceBridgesRoot dispatcher={dispatcher} />
                                        <WorkspaceSessionsRoot dispatcher={dispatcher} modeId={modeId ?? workspace?.id ?? null} />
                                        <WorkspaceUIRoot />
                                        <WorkspaceShell
                                            workspace={workspace}
                                            modeId={modeId}
                                            workspaceContext={workspaceContext}
                                            dispatcher={dispatcher}
                                            {...(shellProps || {})}
                                        />
                                    </>
                                )}
                            </RuntimeDispatchRelay>
                        )}
                    </div>
                </SelectionProvider>
            </WorkspaceSessionProvider>
        </DispatcherProvider>
    );
}
