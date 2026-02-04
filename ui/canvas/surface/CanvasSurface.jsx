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

// Overscan keeps the surface infinite-feeling
const OVERSCAN_MIN = 1500;
const OVERSCAN_MAX = 60000;
const MAJOR_FACTOR = 4;

export function CanvasSurface({ surface, viewport, isDragging = false }) {
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
    const spacing = softClamp(current.size * scale, MIN_SPACING_PX, MAX_SPACING_PX);
    const nextSpacing = next ? softClamp(next.size * scale, MIN_SPACING_PX, MAX_SPACING_PX) : null;

    // Dot radius morph (perceptual)
    const dotRadius = clamp(Math.sqrt(scale) * 1.4, DOT_MIN, DOT_MAX);

    // Opacity never hits zero
    const baseDotOpacity = dotOpacityForScale(scale);

    // Overscan in world px, clamped for perf
    const overscan = clamp(Math.round(2800 / scale), OVERSCAN_MIN, OVERSCAN_MAX);
    const width = `calc(100% + ${overscan * 2}px)`;
    const height = `calc(100% + ${overscan * 2}px)`;

    const minorAlpha = smoothstep(14, 28, spacing);
    const majorAlpha = smoothstep(24, 48, spacing);
    const SNAP_EMPHASIS = {
        dots: 0.75,
        minor: 1.35,
        major: 1.6,
    };
    const emphasis = isDragging ? SNAP_EMPHASIS : null;

    const dotOpacity =
        baseDotOpacity * (1 - minorAlpha * 0.5) * (emphasis ? emphasis.dots : 1);

    const baseStyle = (layerOpacity, opacity) => ({
        position: 'absolute',
        left: -overscan,
        top: -overscan,
        width,
        height,
        pointerEvents: 'none',
        opacity: layerOpacity * opacity,
        transition: 'opacity 120ms ease-out',
    });

    function renderDots(spacingPx, layerOpacity) {
        return (
            <div
                aria-hidden
                style={{
                    ...baseStyle(layerOpacity, dotOpacity),

                    backgroundImage: `radial-gradient(
                        #94a3b8 ${dotRadius}px,
                        transparent ${dotRadius}px
                    )`,
                    backgroundSize: `${spacingPx}px ${spacingPx}px`,

                    // 🌍 world-locked
                    backgroundPosition: `${snapPx(-x * scale)}px ${snapPx(-y * scale)}px`,
                }}
            />
        );
    }

    function renderGrid(spacingPx, layerOpacity) {
        return (
            <div
                aria-hidden
                style={{
                    ...baseStyle(layerOpacity, baseDotOpacity),
                    backgroundImage: `
                        linear-gradient(#cbd5f5 1px, transparent 1px),
                        linear-gradient(90deg, #cbd5f5 1px, transparent 1px)
                    `,
                    backgroundSize: `${spacingPx}px ${spacingPx}px`,
                    backgroundPosition: `${snapPx(-x * scale)}px ${snapPx(-y * scale)}px`,
                }}
            />
        );
    }

    function renderMinorGrid(spacingPx, alpha) {
        return (
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    left: -overscan,
                    top: -overscan,
                    width,
                    height,
                    pointerEvents: 'none',
                    ...baseStyle(1, alpha * 0.25 * (emphasis ? emphasis.minor : 1)),
                    backgroundImage: `
                        linear-gradient(
                            to right,
                            rgba(148,163,184,0.8) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            to bottom,
                            rgba(148,163,184,0.8) 1px,
                            transparent 1px
                        )
                    `,
                    backgroundSize: `${spacingPx}px ${spacingPx}px`,
                    backgroundPosition: `${snapPx(-x * scale)}px ${snapPx(-y * scale)}px`,
                }}
            />
        );
    }

    function renderMajorGrid(spacingPx, alpha) {
        const majorSpacing = spacingPx * MAJOR_FACTOR;

        return (
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    left: -overscan,
                    top: -overscan,
                    width,
                    height,
                    pointerEvents: 'none',
                    ...baseStyle(1, alpha * 0.45 * (emphasis ? emphasis.major : 1)),
                    backgroundImage: `
                        linear-gradient(
                            to right,
                            rgba(148,163,184,1) 2px,
                            transparent 2px
                        ),
                        linear-gradient(
                            to bottom,
                            rgba(148,163,184,1) 2px,
                            transparent 2px
                        )
                    `,
                    backgroundSize: `${majorSpacing}px ${majorSpacing}px`,
                    backgroundPosition: `${snapPx(-x * scale)}px ${snapPx(-y * scale)}px`,
                }}
            />
        );
    }

    return (
        <>
            {surface.type === 'dots' && (
                <>
                    {/* Primary layer */}
                    {renderDots(spacing, next ? 1 - t : 1)}

                    {/* Secondary layer (fade early to avoid double dots) */}
                    {next && t > 0.15 && renderDots(nextSpacing, t * 0.85)}

                    {/* Minor grid */}
                    {minorAlpha > 0.02 && renderMinorGrid(spacing, minorAlpha)}

                    {/* Major grid */}
                    {majorAlpha > 0.02 && renderMajorGrid(spacing, majorAlpha)}
                </>
            )}

            {surface.type === 'grid' && (
                <>
                    {/* Primary layer */}
                    {renderGrid(spacing, next ? 1 - t : 1)}

                    {/* Secondary layer (soft transition between scales) */}
                    {next && t > 0.15 && renderGrid(nextSpacing, t * 0.85)}
                </>
            )}
        </>
    );
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function softClamp(v, min, max) {
    if (v < min) return min + (v - min) * 0.15;
    if (v > max) return max + (v - max) * 0.15;
    return v;
}

function dotOpacityForScale(scale) {
    const center = 1;
    const width = 1.8;
    const d = Math.log2(scale / center);
    const opacity = Math.exp(-(d * d) / width);
    return clamp(opacity, OPACITY_MIN, OPACITY_MAX);
}

function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

function snapPx(v) {
    return Math.round(v * 2) / 2;
}
