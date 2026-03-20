'use client';

function buildPath(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1);
    const control = Math.max(80, dx * 0.5);

    return `M ${x1} ${y1} C ${x1 + control} ${y1}, ${x2 - control} ${y2}, ${x2} ${y2}`;
}

export function GraphEdgeView({ edge, stroke = 'rgba(147, 197, 253, 0.85)', dashed = false, onClick }) {
    const source = edge.sourcePosition ?? { x: 0, y: 0 };
    const target = edge.targetPosition ?? { x: 0, y: 0 };

    return (
        <path
            d={buildPath(source.x, source.y, target.x, target.y)}
            stroke={stroke}
            strokeWidth='2'
            fill='none'
            strokeLinecap='round'
            strokeDasharray={dashed ? '4 4' : undefined}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
        />
    );
}
