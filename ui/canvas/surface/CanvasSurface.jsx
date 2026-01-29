'use client';

// ---- tuning constants ----
const OVERSCAN_MIN = 1500;
const OVERSCAN_MAX = 9000;

// Grid density by zoom tier (world units)
const GRID_BY_SCALE = [
    { minScale: 1.2, size: 8 },
    { minScale: 0.6, size: 16 },
    { minScale: 0.25, size: 32 },
    { minScale: 0.12, size: 64 },
    { minScale: 0, size: 128 },
];

// Dev perf guard
const MAX_SURFACE_PX = 18_000_000; // ~18M px area

export function CanvasSurface({ surface, viewport }) {
    if (!surface) return null;

    const safeViewport = viewport || { x: 0, y: 0, scale: 1 };
    const scale = safeViewport.scale ?? 1;

    // Dynamic overscan (bigger when zoomed out)
    const overscan = clamp(Math.round(2800 / scale), OVERSCAN_MIN, OVERSCAN_MAX);

    const width = `calc(100% + ${overscan * 2}px)`;
    const height = `calc(100% + ${overscan * 2}px)`;

    // Camera transform
    const transform = `
    translate(${-safeViewport.x * scale}px, ${-safeViewport.y * scale}px)
    scale(${scale})
  `;

    // Pick grid density by zoom
    const gridSize = surface.gridSize ?? GRID_BY_SCALE.find((t) => scale >= t.minScale)?.size ?? 64;

    // ---- dev-only perf warning ----
    if (process.env.NODE_ENV === 'development') {
        const approxArea = Math.pow(overscan * 2 + 2000, 2) * scale * scale;
        if (approxArea > MAX_SURFACE_PX) {
            console.warn('[CanvasSurface] Large surface area detected:', Math.round(approxArea / 1_000_000), 'MP');
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
            {/* ---- GRID / DOT SURFACE ---- */}
            {surface.type === 'dots' && (
                <div
                    aria-hidden
                    style={{
                        ...baseStyle,
                        backgroundImage: 'radial-gradient(#94a3b8 1.4px, transparent 1.4px)',
                        backgroundSize: `${gridSize}px ${gridSize}px`,
                    }}
                />
            )}

            {surface.type === 'grid' && (
                <div
                    aria-hidden
                    style={{
                        ...baseStyle,
                        backgroundImage: `
              linear-gradient(#cbd5f5 1px, transparent 1px),
              linear-gradient(90deg, #cbd5f5 1px, transparent 1px)
            `,
                        backgroundSize: `${gridSize}px ${gridSize}px`,
                    }}
                />
            )}

            {/* ---- ORIGIN AXES (fade in at far zoom) ---- */}
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

// ---- utils ----
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
