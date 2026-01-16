export function alignNodes(nodes = [], axis, mode) {
    if (!Array.isArray(nodes) || nodes.length < 2) return [];

    if (axis === 'x') {
        const xs = nodes.map((n) => n.layout.x);
        const centers = nodes.map((n) => n.layout.x + n.layout.width / 2);
        const rights = nodes.map((n) => n.layout.x + n.layout.width);

        const target =
            mode === 'start'
                ? Math.min(...xs)
                : mode === 'center'
                  ? centers.reduce((a, b) => a + b, 0) / centers.length
                  : Math.max(...rights);

        return nodes.map((n) => ({
            id: n.id,
            layout: {
                ...n.layout,
                x: mode === 'start' ? target : mode === 'center' ? target - n.layout.width / 2 : target - n.layout.width,
            },
        }));
    }

    if (axis === 'y') {
        const ys = nodes.map((n) => n.layout.y);
        const centers = nodes.map((n) => n.layout.y + n.layout.height / 2);
        const bottoms = nodes.map((n) => n.layout.y + n.layout.height);

        const target =
            mode === 'start'
                ? Math.min(...ys)
                : mode === 'center'
                  ? centers.reduce((a, b) => a + b, 0) / centers.length
                  : Math.max(...bottoms);

        return nodes.map((n) => ({
            id: n.id,
            layout: {
                ...n.layout,
                y: mode === 'start' ? target : mode === 'center' ? target - n.layout.height / 2 : target - n.layout.height,
            },
        }));
    }

    return [];
}

export function distributeNodes(nodes = [], axis) {
    if (!Array.isArray(nodes) || nodes.length < 3) return [];

    const sorted = [...nodes].sort((a, b) =>
        axis === 'x' ? a.layout.x - b.layout.x : a.layout.y - b.layout.y
    );

    const start = axis === 'x' ? sorted[0].layout.x : sorted[0].layout.y;
    const last = sorted[sorted.length - 1];
    const end =
        axis === 'x'
            ? last.layout.x + last.layout.width
            : last.layout.y + last.layout.height;

    const totalSize = sorted.reduce(
        (sum, n) => sum + (axis === 'x' ? n.layout.width : n.layout.height),
        0
    );

    const gap = (end - start - totalSize) / (sorted.length - 1);

    let cursor = start;

    return sorted.map((n) => {
        const layout = { ...n.layout };
        if (axis === 'x') {
            layout.x = cursor;
            cursor += layout.width + gap;
        } else {
            layout.y = cursor;
            cursor += layout.height + gap;
        }
        return { id: n.id, layout };
    });
}
