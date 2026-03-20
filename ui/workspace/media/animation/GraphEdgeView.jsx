'use client';

export function GraphEdgeView({ edge }) {
    const source = edge.sourcePosition ?? { x: 0, y: 0 };
    const target = edge.targetPosition ?? { x: 0, y: 0 };

    return (
        <line
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke='rgba(147, 197, 253, 0.85)'
            strokeWidth='2'
            strokeLinecap='round'
        />
    );
}
