'use client';

import { CanvasSurfaceTypes } from '@/platform/workspaces';
import { useCanvasContext, useCanvasViewState } from '@/ui/canvas/CanvasContext.jsx';
import { canvasSurfaceIntentSet } from '@/ui/workspace/canvasSurfaceIntent.js';

const OPTIONS = [
    { id: CanvasSurfaceTypes.SMOOTH, label: 'Smooth', snap: false },
    { id: CanvasSurfaceTypes.DOTS, label: 'Dots', snap: false },
    { id: CanvasSurfaceTypes.GRID, label: 'Grid', snap: true },
];

export function CanvasSurfaceSwitcher() {
    const surface = useCanvasViewState((state) => state.canvasSurface);
    const { readOnly, setCanvasSurface } = useCanvasContext();
    const currentType = surface?.type ?? CanvasSurfaceTypes.SMOOTH;
    const gridSize = surface?.gridSize ?? 8;

    function applySurface(nextType) {
        if (readOnly) return;
        const nextOption = OPTIONS.find((option) => option.id === nextType);
        if (!nextOption) return;

        const nextSurface = {
            type: nextOption.id,
            gridSize,
            snap: nextOption.snap,
        };

        if (typeof setCanvasSurface === 'function') {
            setCanvasSurface(nextSurface);
            return;
        }

        canvasSurfaceIntentSet({ surface: nextSurface });
    }

    return (
        <div
            style={{
                pointerEvents: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: 4,
                borderRadius: 12,
                border: '1px solid rgba(203,213,225,0.95)',
                background: 'rgba(255,255,255,0.92)',
                boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
                backdropFilter: 'blur(10px)',
            }}>
            {OPTIONS.map((option) => {
                const active = option.id === currentType;
                return (
                    <button
                        key={option.id}
                        type='button'
                        onClick={() => applySurface(option.id)}
                        aria-pressed={active}
                        style={{
                            border: active ? '1px solid #2563eb' : '1px solid transparent',
                            background: active ? 'rgba(37,99,235,0.12)' : 'transparent',
                            color: active ? '#1d4ed8' : '#334155',
                            borderRadius: 8,
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: readOnly ? 'default' : 'pointer',
                            opacity: readOnly ? 0.6 : 1,
                        }}>
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
