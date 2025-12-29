export function findDropTarget(pointer, containers) {
    return containers.find((c) => {
        const x = c.x ?? 0;
        const y = c.y ?? 0;
        const w = c.width ?? 0;
        const h = c.height ?? 0;

        return pointer.x >= x && pointer.x <= x + w && pointer.y >= y && pointer.y <= y + h;
    });
}
