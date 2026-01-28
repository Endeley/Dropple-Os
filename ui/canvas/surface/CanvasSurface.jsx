'use client';

export function CanvasSurface({ surface, viewport }) {
    if (!surface) return null;
    const safeViewport = viewport || { x: 0, y: 0, scale: 1 };
    const scale = safeViewport.scale ?? 1;
    const transform = `translate(${-safeViewport.x * scale}px, ${-safeViewport.y * scale}px) scale(${scale})`;

    if (surface.type === 'smooth') return null;

    if (surface.type === 'dots') {
        const size = surface.gridSize || 16;
        return (
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
                    backgroundSize: `${size}px ${size}px`,
                    transform,
                    pointerEvents: 'none',
                }}
            />
        );
    }

    if (surface.type === 'grid') {
        const size = surface.gridSize || 8;
        return (
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
            linear-gradient(#e5e7eb 1px, transparent 1px),
            linear-gradient(90deg, #e5e7eb 1px, transparent 1px)
          `,
                    backgroundSize: `${size}px ${size}px`,
                    transform,
                    pointerEvents: 'none',
                }}
            />
        );
    }

    return null;
}
