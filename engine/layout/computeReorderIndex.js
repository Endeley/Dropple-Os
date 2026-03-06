function getChildRect(child) {
    const layout = child?.layout || {};
    return {
        x: layout.x ?? child?.x ?? 0,
        y: layout.y ?? child?.y ?? 0,
        width: layout.width ?? child?.width ?? 0,
        height: layout.height ?? child?.height ?? 0,
    };
}

export function computeReorderIndex({ pointer, container, children }) {
    const auto = container?.layout?.autoLayout;
    if (!auto || !Array.isArray(children)) return 0;

    if (auto.type === 'grid') {
        const width = container?.layout?.width ?? container?.width ?? 0;
        const columns = Math.max(1, auto.columns ?? 1);
        const gap = auto.gap ?? 0;
        const padding = auto.padding ?? 0;
        const cellW = (width - padding * 2 - gap * (columns - 1)) / columns;

        const col = Math.max(
            0,
            Math.min(
                columns - 1,
                Math.floor((pointer.x - padding) / (cellW + gap)),
            ),
        );

        const first = children[0] ? getChildRect(children[0]) : { height: 1 };
        const rowH = (first.height || 1) + gap;
        const row = Math.max(0, Math.floor((pointer.y - padding) / rowH));

        return row * columns + col;
    }

    const isVertical = auto.direction === 'column';
    const pos = isVertical ? pointer.y : pointer.x;
    let index = 0;

    for (let i = 0; i < children.length; i++) {
        const rect = getChildRect(children[i]);
        const mid = isVertical
            ? rect.y + rect.height / 2
            : rect.x + rect.width / 2;

        if (pos < mid) {
            index = i;
            break;
        }

        index = i + 1;
    }

    return index;
}
