export function computeReorderIndex({ pointer, container, children }) {
    const isVertical = container.layout.mode === 'auto-y';

    let index = 0;

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const mid = isVertical
            ? (child.y ?? 0) + (child.height ?? 0) / 2
            : (child.x ?? 0) + (child.width ?? 0) / 2;

        const pos = isVertical ? pointer.y : pointer.x;

        if (pos < mid) {
            index = i;
            break;
        }

        index = i + 1;
    }

    return index;
}
