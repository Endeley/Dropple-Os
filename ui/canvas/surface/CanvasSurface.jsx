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

const OPACITY_MIN = 0.28;
const OPACITY_MAX = 1;

// Screen-space spacing clamps
const MIN_SPACING_PX = 3.5;
const MAX_SPACING_PX = 260;

// Overscan for infinite-feeling stage
const OVERSCAN_MIN = 1500;
const OVERSCAN_MAX = 60000;

const MAJOR_FACTOR = 4;

export function CanvasSurface({ surface, viewport, isDragging = false }) {
    const { x = 0, y = 0, scale = 1 } = viewport ?? {};
    const surfaceType = surface?.type ?? 'smooth';

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

    const spacing = softClamp(current.size * scale, MIN_SPACING_PX, MAX_SPACING_PX);

    const nextSpacing = next ? softClamp(next.size * scale, MIN_SPACING_PX, MAX_SPACING_PX) : null;

    const dotRadius = clamp(Math.sqrt(scale) * 1.4, DOT_MIN, DOT_MAX);
    const baseDotOpacity = dotOpacityForScale(scale);

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

    const dotOpacity = baseDotOpacity * (1 - minorAlpha * 0.5) * (emphasis ? emphasis.dots : 1);

    const worldOffsetX = snapPx(-x * scale);
    const worldOffsetY = snapPx(-y * scale);

    function layerBase(zIndex = 0) {
        return {
            position: 'absolute',
            left: -overscan,
            top: -overscan,
            width,
            height,
            pointerEvents: 'none',
            zIndex,
        };
    }

    function renderBackgroundTint() {
        return (
            <div
                aria-hidden
                style={{
                    ...layerBase(0),
                    background: `
                        radial-gradient(
                            circle at top left,
                            rgba(255,255,255,0.75) 0%,
                            rgba(248,250,252,1) 35%,
                            rgba(241,245,249,1) 100%
                        )
                    `,
                }}
            />
        );
    }

    function renderDots(spacingPx, layerOpacity) {
        return (
            <div
                aria-hidden
                style={{
                    ...layerBase(1),
                    opacity: layerOpacity * dotOpacity,
                    transition: 'opacity 120ms ease-out',
                    backgroundImage: `radial-gradient(
                        rgba(100,116,139,0.72) ${dotRadius}px,
                        transparent ${dotRadius}px
                    )`,
                    backgroundSize: `${spacingPx}px ${spacingPx}px`,
                    backgroundPosition: `${worldOffsetX}px ${worldOffsetY}px`,
                }}
            />
        );
    }

    function renderGrid(spacingPx, layerOpacity) {
        return (
            <div
                aria-hidden
                style={{
                    ...layerBase(1),
                    opacity: layerOpacity * baseDotOpacity,
                    transition: 'opacity 120ms ease-out',
                    backgroundImage: `
                        linear-gradient(rgba(148,163,184,0.42) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(148,163,184,0.42) 1px, transparent 1px)
                    `,
                    backgroundSize: `${spacingPx}px ${spacingPx}px`,
                    backgroundPosition: `${worldOffsetX}px ${worldOffsetY}px`,
                }}
            />
        );
    }

    function renderMinorGrid(spacingPx, alpha) {
        return (
            <div
                aria-hidden
                style={{
                    ...layerBase(2),
                    opacity: alpha * 0.28 * (emphasis ? emphasis.minor : 1),
                    transition: 'opacity 120ms ease-out',
                    backgroundImage: `
                        linear-gradient(
                            to right,
                            rgba(148,163,184,0.62) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            to bottom,
                            rgba(148,163,184,0.62) 1px,
                            transparent 1px
                        )
                    `,
                    backgroundSize: `${spacingPx}px ${spacingPx}px`,
                    backgroundPosition: `${worldOffsetX}px ${worldOffsetY}px`,
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
                    ...layerBase(3),
                    opacity: alpha * 0.42 * (emphasis ? emphasis.major : 1),
                    transition: 'opacity 120ms ease-out',
                    backgroundImage: `
                        linear-gradient(
                            to right,
                            rgba(100,116,139,0.88) 2px,
                            transparent 2px
                        ),
                        linear-gradient(
                            to bottom,
                            rgba(100,116,139,0.88) 2px,
                            transparent 2px
                        )
                    `,
                    backgroundSize: `${majorSpacing}px ${majorSpacing}px`,
                    backgroundPosition: `${worldOffsetX}px ${worldOffsetY}px`,
                }}
            />
        );
    }

    return (
        <>
            {renderBackgroundTint()}

            {surfaceType === 'dots' && (
                <>
                    {renderDots(spacing, next ? 1 - t : 1)}
                    {next && t > 0.15 && nextSpacing ? renderDots(nextSpacing, t * 0.85) : null}

                    {minorAlpha > 0.02 ? renderMinorGrid(spacing, minorAlpha) : null}

                    {majorAlpha > 0.02 ? renderMajorGrid(spacing, majorAlpha) : null}
                </>
            )}

            {surfaceType === 'grid' && (
                <>
                    {renderGrid(spacing, next ? 1 - t : 1)}
                    {next && t > 0.15 && nextSpacing ? renderGrid(nextSpacing, t * 0.85) : null}
                </>
            )}

            {surfaceType === 'smooth' && (
                <>
                    {renderDots(softClamp(28 * scale, 10, 60), 0.42)}
                    {renderMajorGrid(softClamp(28 * scale, 10, 60), 0.16)}
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
