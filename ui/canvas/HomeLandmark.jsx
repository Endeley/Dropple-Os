'use client';

import {
    hasProjectHistory,
    isCreateUiWorld,
    resolveProjectHome,
} from '@/runtime/workspaces/projectSubstrateNavigation.js';

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function HomeLandmark({
    workspaceId = null,
    modeId = null,
    viewport = null,
    nodeCount = 0,
    worldHistory = null,
}) {
    if (!isCreateUiWorld({ workspaceId, modeId })) return null;

    const home = resolveProjectHome({ workspaceId, modeId });
    const scale = Number.isFinite(viewport?.scale) ? viewport.scale : 1;
    const inverseScale = clamp(1 / Math.max(scale, 0.001), 0.4, 2.4);
    const hasWork = hasProjectHistory({ workspaceId, modeId, nodeCount, worldHistory });

    const fieldSize = (hasWork ? 320 : 420) * inverseScale;
    const outerSize = (hasWork ? 236 : 308) * inverseScale;
    const middleSize = (hasWork ? 132 : 168) * inverseScale;
    const innerSize = (hasWork ? 38 : 48) * inverseScale;
    const dotSize = (hasWork ? 8 : 10) * inverseScale;
    const crossSize = (hasWork ? 40 : 52) * inverseScale;
    const strokeWidth = Math.max(1, 1.75 * inverseScale);
    const fieldOpacity = hasWork ? 0.55 : 1;
    const ringOpacity = hasWork ? 0.62 : 1;
    const dotOpacity = hasWork ? 0.72 : 1;

    return (
        <div
            aria-hidden
            data-home-landmark='true'
            style={{
                position: 'absolute',
                left: home.x,
                top: home.y,
                width: 0,
                height: 0,
                pointerEvents: 'none',
                zIndex: 0,
            }}>
            <div
                style={{
                    position: 'absolute',
                    left: -fieldSize / 2,
                    top: -fieldSize / 2,
                    width: fieldSize,
                    height: fieldSize,
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(99,102,241,0.085) 0%, rgba(99,102,241,0.05) 22%, rgba(99,102,241,0.022) 44%, rgba(99,102,241,0.008) 58%, rgba(99,102,241,0) 76%)',
                    opacity: fieldOpacity,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: -outerSize / 2,
                    top: -outerSize / 2,
                    width: outerSize,
                    height: outerSize,
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(99,102,241,0.085) 0%, rgba(99,102,241,0.052) 26%, rgba(99,102,241,0.02) 48%, rgba(99,102,241,0) 72%)',
                    opacity: fieldOpacity,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: -middleSize / 2,
                    top: -middleSize / 2,
                    width: middleSize,
                    height: middleSize,
                    borderRadius: '50%',
                    border: `${strokeWidth}px solid rgba(99, 102, 241, 0.18)`,
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.16) inset',
                    opacity: ringOpacity,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: -(middleSize * 0.62) / 2,
                    top: -(middleSize * 0.62) / 2,
                    width: middleSize * 0.62,
                    height: middleSize * 0.62,
                    borderRadius: '50%',
                    border: `${Math.max(1, strokeWidth * 0.9)}px solid rgba(99, 102, 241, 0.12)`,
                    opacity: ringOpacity,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: -innerSize / 2,
                    top: -innerSize / 2,
                    width: innerSize,
                    height: innerSize,
                    borderRadius: '50%',
                    border: `${strokeWidth}px solid rgba(99, 102, 241, 0.32)`,
                    background: 'rgba(255,255,255,0.24)',
                    backdropFilter: 'blur(2px)',
                    opacity: ringOpacity,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: -crossSize / 2,
                    top: -0.5,
                    width: crossSize,
                    height: 1,
                    background: 'rgba(99, 102, 241, 0.28)',
                    opacity: ringOpacity,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: -0.5,
                    top: -crossSize / 2,
                    width: 1,
                    height: crossSize,
                    background: 'rgba(99, 102, 241, 0.28)',
                    opacity: ringOpacity,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: -dotSize / 2,
                    top: -dotSize / 2,
                    width: dotSize,
                    height: dotSize,
                    borderRadius: '50%',
                    background: 'rgba(79, 70, 229, 0.84)',
                    boxShadow: '0 0 16px rgba(99,102,241,0.36)',
                    opacity: dotOpacity,
                }}
            />
        </div>
    );
}

export default HomeLandmark;
