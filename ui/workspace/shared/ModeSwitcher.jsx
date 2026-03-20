'use client';

import { CANONICAL_WORKSPACES } from '@/platform/workspaces';

export function ModeSwitcher({ workspace, activeMode, onChange }) {
    const workspaceDefinition = CANONICAL_WORKSPACES[workspace];
    const modes = Object.values(workspaceDefinition?.modes ?? {});

    if (!modes.length) return null;

    return (
        <div
            aria-label='Mode switcher'
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
            {modes.map((mode) => {
                const isActive = mode.id === activeMode;
                return (
                    <button
                        key={mode.id}
                        type='button'
                        onClick={() => onChange?.(mode.id)}
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
                        {mode.label}
                    </button>
                );
            })}
        </div>
    );
}
