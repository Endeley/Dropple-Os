'use client';

import { useMemo } from 'react';
import { CanvasSurfaceTypes } from '@/workspaces/registry/canvasSurfacePolicy.js';
import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';
import { setCanvasSurface } from '@/runtime/state/workspaceState.js';

const SURFACE_OPTIONS = [
    { id: CanvasSurfaceTypes.SMOOTH, label: 'Smooth', snap: false },
    { id: CanvasSurfaceTypes.DOTS, label: 'Dots', snap: false },
    { id: CanvasSurfaceTypes.GRID, label: 'Grid', snap: true },
];

export function CanvasSurfacePanel() {
    const surface = useWorkspaceState((state) => state.canvasSurface);
    const currentType = surface?.type ?? CanvasSurfaceTypes.SMOOTH;
    const gridSize = surface?.gridSize ?? 8;

    const options = useMemo(() => SURFACE_OPTIONS, []);

    function applySurface(nextType) {
        const nextOption = options.find((option) => option.id === nextType);
        if (!nextOption) return;

        setCanvasSurface({
            type: nextOption.id,
            gridSize,
            snap: nextOption.snap,
        });
    }

    return (
        <section style={{ padding: 12, borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Canvas Surface
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {options.map((option) => (
                    <button
                        key={option.id}
                        type='button'
                        onClick={() => applySurface(option.id)}
                        style={{
                            fontSize: 12,
                            padding: '6px 10px',
                            borderRadius: 6,
                            border:
                                option.id === currentType
                                    ? '1px solid #2563eb'
                                    : '1px solid #e5e7eb',
                            background:
                                option.id === currentType
                                    ? 'rgba(37,99,235,0.08)'
                                    : '#fff',
                            color: option.id === currentType ? '#1d4ed8' : '#111827',
                            cursor: 'pointer',
                        }}>
                        {option.label}
                    </button>
                ))}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280' }}>
                Grid enables snapping automatically.
            </div>
        </section>
    );
}
