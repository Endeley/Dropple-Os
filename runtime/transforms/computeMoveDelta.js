export function computeMoveDelta(startPointer, pointer) {
    if (!startPointer || !pointer) {
        return { dx: 0, dy: 0 };
    }

    return {
        dx: pointer.x - startPointer.x,
        dy: pointer.y - startPointer.y,
    };
}
