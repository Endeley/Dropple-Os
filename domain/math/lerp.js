export function lerp(a, b, t) {
    if (typeof a === 'number' && typeof b === 'number') {
        return a + (b - a) * t;
    }
    return t < 1 ? a : b;
}
