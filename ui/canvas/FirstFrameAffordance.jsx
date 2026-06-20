'use client';

import {
    hasProjectHistory,
    isCreateUiWorld,
    resolveFirstFrameBounds,
} from '@/runtime/workspaces/projectSubstrateNavigation.js';

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export default function FirstFrameAffordance({
    workspaceId = null,
    modeId = null,
    viewport = null,
    activeTool = 'select',
    nodeCount = 0,
    worldHistory = null,
}) {
    if (!isCreateUiWorld({ workspaceId, modeId })) return null;
    if (activeTool !== 'frame') return null;
    if (hasProjectHistory({ workspaceId, modeId, nodeCount, worldHistory })) return null;

    const bounds = resolveFirstFrameBounds({
        workspaceId,
        modeId,
        nodeCount,
        worldHistory,
    });

    if (!bounds) return null;

    const scale = Number.isFinite(viewport?.scale) ? viewport.scale : 1;
    const inverseScale = clamp(1 / Math.max(scale, 0.001), 0.55, 2.2);
    const strokeWidth = Math.max(1, 1.4 * inverseScale);
    const radius = 20 * inverseScale;
    const shadowBlur = 44 * inverseScale;

    return (
        <div
            aria-hidden
            data-first-frame-affordance='true'
            style={{
                position: 'absolute',
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
                pointerEvents: 'none',
                borderRadius: radius,
                border: `${strokeWidth}px dashed rgba(99, 102, 241, 0.28)`,
                background:
                    'linear-gradient(180deg, rgba(99,102,241,0.055) 0%, rgba(99,102,241,0.02) 100%)',
                boxShadow: `0 0 ${shadowBlur}px rgba(99,102,241,0.08), inset 0 0 0 1px rgba(255,255,255,0.3)`,
                zIndex: 0,
            }}>
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: radius,
                    background:
                        'radial-gradient(circle at 18% 16%, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.028) 20%, rgba(99,102,241,0) 42%)',
                }}
            />
        </div>
    );
}
