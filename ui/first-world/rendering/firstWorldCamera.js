function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

export { clamp, lerp };

function sampleCameraPoint(travelStops, progress) {
    const segmentCount = travelStops.length - 1;
    const scaledProgress = progress * segmentCount;
    const baseIndex = Math.min(segmentCount - 1, Math.max(0, Math.floor(scaledProgress)));
    const segmentProgress = clamp(scaledProgress - baseIndex, 0, 1);
    const fromStop = travelStops[baseIndex];
    const toStop = travelStops[baseIndex + 1];

    return Object.freeze({
        x: lerp(fromStop.x ?? 0, toStop.x ?? 0, segmentProgress),
        y: lerp(fromStop.y ?? 0, toStop.y ?? 0, segmentProgress),
        z: lerp(fromStop.z ?? 0, toStop.z ?? 0, segmentProgress),
    });
}

export function interpolateCamera(travelStops, progress) {
    const point = sampleCameraPoint(travelStops, progress);

    return Object.freeze({
        x: point.x,
        y: point.y,
        z: point.z,
        progress,
    });
}
