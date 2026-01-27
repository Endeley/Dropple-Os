'use client';

import { DispatcherProvider } from './DispatcherProvider/DispatcherProvider.jsx';
import { WorkspaceUIRoot } from './DispatcherProvider/UI/WorkspaceUIRoot.jsx';
import { WorkspaceCanvasRoot } from './DispatcherProvider/Canvas/WorkspaceCanvasRoot.jsx';
import { WorkspaceSessionsRoot } from './DispatcherProvider/Sessions/WorkspaceSessionsRoot.jsx';
import { WorkspaceBridgesRoot } from './DispatcherProvider/Bridges/WorkspaceBridgesRoot.jsx';
import { SelectionProvider } from '@/ui/workspace/shared/SelectionContext';

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
    uxEnforcementTier = 2,
}) {
    const isUXMode = profile === 'ux-validation';

    return (
        <DispatcherProvider
            workspaceId={workspaceId}
            branchId={branchId}
            profile={profile}
            uxEnforcementTier={uxEnforcementTier}>
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

                    <WorkspaceBridgesRoot />
                    <WorkspaceSessionsRoot />
                    <WorkspaceUIRoot />
                    <WorkspaceCanvasRoot />
                </div>
            </SelectionProvider>
        </DispatcherProvider>
    );
}
