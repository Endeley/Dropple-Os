'use client';

// ─────────────────────────────────────────────
// Tunables
// ─────────────────────────────────────────────

const OVERSCAN_MIN = 1500;
const OVERSCAN_MAX = 9000;

// Grid density by zoom scale
const GRID_BY_SCALE = [
    { minScale: 1.2, size: 8 },
    { minScale: 0.6, size: 16 },
    { minScale: 0.25, size: 32 },
    { minScale: 0.12, size: 64 },
    { minScale: 0, size: 128 },
];

// Every N minor cells, draw a major line
const MAJOR_LINE_INTERVAL = 5;

// Beyond this zoom, CSS grids are disabled (perf safety)
const EXTREME_ZOOM_OUT = 0.06;

// Dev perf guard
const MAX_SURFACE_MP = 18; // megapixels

// ─────────────────────────────────────────────

export function CanvasSurface({ surface, viewport }) {
    if (!surface) return null;

    const safeViewport = viewport || { x: 0, y: 0, scale: 1 };
    const scale = safeViewport.scale ?? 1;

    // Extreme zoom-out → disable grid entirely (future WebGL hook)
    if (scale < EXTREME_ZOOM_OUT) {
        return null; // behaves like "smooth"
    }

    // Dynamic overscan (world px)
    const overscan = clamp(Math.round(2800 / scale), OVERSCAN_MIN, OVERSCAN_MAX);

    const width = `calc(100% + ${overscan * 2}px)`;
    const height = `calc(100% + ${overscan * 2}px)`;

    // Camera transform
    const transform = `
    translate(${-safeViewport.x * scale}px, ${-safeViewport.y * scale}px)
    scale(${scale})
  `;

    // Grid size by zoom
    const gridSize = surface.gridSize ?? GRID_BY_SCALE.find((t) => scale >= t.minScale)?.size ?? 64;

    const majorSize = gridSize * MAJOR_LINE_INTERVAL;

    // Theme (safe defaults)
    const minorColor = surface.theme?.minor ?? '#cbd5f5';
    const majorColor = surface.theme?.major ?? '#94a3b8';

    // Dev-only perf warning
    if (process.env.NODE_ENV === 'development') {
        const approxMP = ((overscan * 2 + 2000) ** 2 * scale * scale) / 1_000_000;
        if (approxMP > MAX_SURFACE_MP) {
            console.warn(`[CanvasSurface] Large surface area: ${approxMP.toFixed(1)} MP`);
        }
    }

    if (surface.type === 'smooth') return null;

    const baseStyle = {
        position: 'absolute',
        left: -overscan,
        top: -overscan,
        width,
        height,
        transform,
        pointerEvents: 'none',
    };

    return (
        <>
            {/* ───────── Minor grid / dots ───────── */}
            {surface.type === 'dots' && (
                <div
                    aria-hidden
                    style={{
                        ...baseStyle,
                        backgroundImage: `radial-gradient(${minorColor} 1.4px, transparent 1.4px)`,
                        backgroundSize: `${gridSize}px ${gridSize}px`,
                    }}
                />
            )}

            {surface.type === 'grid' && (
                <>
                    {/* Minor grid */}
                    <div
                        aria-hidden
                        style={{
                            ...baseStyle,
                            backgroundImage: `
                linear-gradient(${minorColor} 1px, transparent 1px),
                linear-gradient(90deg, ${minorColor} 1px, transparent 1px)
              `,
                            backgroundSize: `${gridSize}px ${gridSize}px`,
                        }}
                    />

                    {/* Major grid */}
                    <div
                        aria-hidden
                        style={{
                            ...baseStyle,
                            backgroundImage: `
                linear-gradient(${majorColor} 1px, transparent 1px),
                linear-gradient(90deg, ${majorColor} 1px, transparent 1px)
              `,
                            backgroundSize: `${majorSize}px ${majorSize}px`,
                            opacity: 0.45,
                        }}
                    />
                </>
            )}

            {/* ───────── World origin axes (far zoom) ───────── */}
            {scale < 0.35 && (
                <>
                    {/* X axis */}
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            left: -overscan,
                            top: -safeViewport.y * scale,
                            width,
                            height: 1,
                            background: 'rgba(59,130,246,0.35)',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Y axis */}
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            left: -safeViewport.x * scale,
                            top: -overscan,
                            width: 1,
                            height,
                            background: 'rgba(59,130,246,0.35)',
                            pointerEvents: 'none',
                        }}
                    />
                </>
            )}
        </>
    );
}

// ─────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
