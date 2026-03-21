function clamp01(value) {
    if (!Number.isFinite(value)) return 0;
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function computeVelocity(previousPointer, currentPointer) {
    if (!previousPointer || !currentPointer) {
        return { vx: 0, vy: 0, speed: 0 };
    }

    const vx = currentPointer.x - previousPointer.x;
    const vy = currentPointer.y - previousPointer.y;
    const speed = Math.hypot(vx, vy);

    return { vx, vy, speed };
}

export function applyMagneticSnap(rawDelta, resolvedDelta, options = {}) {
    const {
        threshold = 8,
        minStrength = 0.15,
        maxStrength = 1,
        velocity = { speed: 0 },
        velocityFalloff = 0.08,
    } = options;

    const rawDx = rawDelta?.dx ?? 0;
    const rawDy = rawDelta?.dy ?? 0;
    const snapDx = resolvedDelta?.dx ?? rawDx;
    const snapDy = resolvedDelta?.dy ?? rawDy;

    const distX = Math.abs(snapDx - rawDx);
    const distY = Math.abs(snapDy - rawDy);

    const baseStrengthX =
        distX <= 0 ? 1 : clamp01(1 - distX / Math.max(1, threshold));
    const baseStrengthY =
        distY <= 0 ? 1 : clamp01(1 - distY / Math.max(1, threshold));

    const speed = velocity?.speed ?? 0;
    const velocityFactor = clamp01(1 - speed * velocityFalloff);

    const strengthX = clamp01(
        Math.max(minStrength, baseStrengthX * maxStrength * velocityFactor),
    );
    const strengthY = clamp01(
        Math.max(minStrength, baseStrengthY * maxStrength * velocityFactor),
    );

    return {
        dx: lerp(rawDx, snapDx, strengthX),
        dy: lerp(rawDy, snapDy, strengthY),
        strength: {
            x: strengthX,
            y: strengthY,
        },
    };
}
