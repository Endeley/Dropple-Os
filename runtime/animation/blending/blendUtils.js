export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function safeNumber(value) {
    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
}

export function stableCompare(left, right) {
    return String(left ?? '').localeCompare(String(right ?? ''));
}

