'use client';

const GRID_LEVELS = [
    { min: 2.5, size: 8 },
    { min: 1.2, size: 16 },
    { min: 0.6, size: 32 },
    { min: 0.25, size: 64 },
    { min: 0, size: 128 },
];

// Dot tuning
const DOT_MIN = 0.9;
const DOT_MAX = 2.6;

const OPACITY_MIN = 0.22;
const OPACITY_MAX = 1;

// 🔑 Critical clamps (THIS fixes smooth canvas)
const MIN_SPACING_PX = 3.5;
const MAX_SPACING_PX = 260;

export function CanvasSurface({ surface, viewport }) {
    if (!surface || surface.type === 'smooth') return null;

    const { x = 0, y = 0, scale = 1 } = viewport ?? {};

    // LOD selection
    const idx = GRID_LEVELS.findIndex((l) => scale >= l.min);
    const current = GRID_LEVELS[idx] ?? GRID_LEVELS.at(-1);
    const next = GRID_LEVELS[idx - 1];

    // Morph factor
    let t = 0;
    if (next) {
        const range = next.min - current.min;
        t = range > 0 ? (scale - current.min) / range : 0;
        t = clamp(t, 0, 1);
    }

    // 🔒 Clamp spacing in SCREEN SPACE
    const spacing = clamp(current.size * scale, MIN_SPACING_PX, MAX_SPACING_PX);
    const nextSpacing = next ? clamp(next.size * scale, MIN_SPACING_PX, MAX_SPACING_PX) : null;

    // Dot radius morph (perceptual)
    const dotRadius = clamp(Math.sqrt(scale) * 1.4, DOT_MIN, DOT_MAX);

    // Opacity never hits zero
    const opacity = clamp(0.35 + scale * 0.45, OPACITY_MIN, OPACITY_MAX);

    function renderDots(spacingPx, layerOpacity) {
        return (
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    opacity: layerOpacity * opacity,

                    backgroundImage: `radial-gradient(
                        #94a3b8 ${dotRadius}px,
                        transparent ${dotRadius}px
                    )`,
                    backgroundSize: `${spacingPx}px ${spacingPx}px`,

                    // 🌍 world-locked
                    backgroundPosition: `${-x * scale}px ${-y * scale}px`,
                }}
            />
        );
    }

    return (
        <>
            {/* Primary layer */}
            {renderDots(spacing, next ? 1 - t : 1)}

            {/* Secondary layer (fade early to avoid double dots) */}
            {next && t > 0.15 && renderDots(nextSpacing, t * 0.85)}
        </>
    );
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
