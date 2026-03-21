function normalizeDelta(angle) {
    const tau = Math.PI * 2;
    let next = angle;
    while (next > Math.PI) next -= tau;
    while (next < -Math.PI) next += tau;
    return next;
}

export function snapAngle(angle, options = {}) {
    const stepDegrees = Number.isFinite(options?.step) ? options.step : 15;
    const thresholdDegrees = Number.isFinite(options?.threshold) ? options.threshold : 6;
    const step = (stepDegrees * Math.PI) / 180;
    const threshold = (thresholdDegrees * Math.PI) / 180;
    const snapped = Math.round(angle / step) * step;
    const distance = Math.abs(normalizeDelta(snapped - angle));

    if (distance <= threshold) {
        return {
            angle: snapped,
            snapped: true,
        };
    }

    return {
        angle,
        snapped: false,
    };
}
