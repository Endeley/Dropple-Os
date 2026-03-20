'use client';

import { CANONICAL_WORKSPACES } from '@/platform/workspaces';

export function WorkspaceSwitcher({ activeWorkspace, onChange }) {
    const workspaces = Object.values(CANONICAL_WORKSPACES);

    return (
        <div
            aria-label='Workspace switcher'
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: 6,
                borderRadius: 999,
                border: '1px solid rgba(148, 163, 184, 0.35)',
                background: 'rgba(15, 23, 42, 0.84)',
                backdropFilter: 'blur(10px)',
            }}>
            {workspaces.map((workspace) => {
                const isActive = workspace.id === activeWorkspace;
                return (
                    <button
                        key={workspace.id}
                        type='button'
                        onClick={() => onChange?.(workspace.id)}
                        style={{
                            border: 'none',
                            borderRadius: 999,
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: isActive ? '#f8fafc' : 'transparent',
                            color: isActive ? '#0f172a' : '#e2e8f0',
                        }}>
                        {workspace.label}
                    </button>
                );
            })}
        </div>
    );
}
