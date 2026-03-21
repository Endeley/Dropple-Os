function clamp01(value) {
    if (!Number.isFinite(value)) return 0;
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function applyMagneticRotation(rawAngle, snappedAngle, options = {}) {
    const thresholdDegrees = Number.isFinite(options?.threshold) ? options.threshold : 6;
    const threshold = (thresholdDegrees * Math.PI) / 180;
    const speed = Number.isFinite(options?.velocity?.speed) ? options.velocity.speed : 0;
    const velocityFalloff = Number.isFinite(options?.velocityFalloff) ? options.velocityFalloff : 0.05;
    const minStrength = Number.isFinite(options?.minStrength) ? options.minStrength : 0.15;
    const maxStrength = Number.isFinite(options?.maxStrength) ? options.maxStrength : 1;
    const distance = Math.abs(snappedAngle - rawAngle);
    const baseStrength =
        distance <= 0 ? 1 : clamp01(1 - distance / Math.max(threshold, Number.EPSILON));
    const velocityFactor = clamp01(1 - speed * velocityFalloff);
    const strength = clamp01(
        Math.max(minStrength, baseStrength * maxStrength * velocityFactor),
    );

    return lerp(rawAngle, snappedAngle, strength);
}
