'use client';

const GRID_LEVELS = [
    { minScale: 2.5, worldSize: 8 },
    { minScale: 1.2, worldSize: 16 },
    { minScale: 0.6, worldSize: 32 },
    { minScale: 0.25, worldSize: 64 },
    { minScale: 0.1, worldSize: 128 },
    { minScale: 0, worldSize: 256 },
];

export function CanvasSurface({ surface, viewport }) {
    if (!surface || surface.type === 'smooth') return null;

    const { x = 0, y = 0, scale = 1 } = viewport ?? {};

    const level = GRID_LEVELS.find((l) => scale >= l.minScale) ?? GRID_LEVELS[GRID_LEVELS.length - 1];

    const worldSize = surface.gridSize ?? level.worldSize;

    // Screen size with clamp (🔑 THIS FIXES DISAPPEARING)
    const screenSize = Math.max(worldSize * scale, 6);

    // Fade instead of vanish
    const opacity = scale > 0.4 ? 1 : scale > 0.15 ? 0.6 : scale > 0.05 ? 0.35 : 0.2;

    return (
        <div
            aria-hidden
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                opacity,

                backgroundImage:
                    surface.type === 'dots'
                        ? 'radial-gradient(#94a3b8 1.4px, transparent 1.4px)'
                        : `
                linear-gradient(#cbd5f5 1px, transparent 1px),
                linear-gradient(90deg, #cbd5f5 1px, transparent 1px)
              `,

                backgroundSize: `${screenSize}px ${screenSize}px`,
                backgroundPosition: `${-x * scale}px ${-y * scale}px`,
            }}
        />
    );
}
