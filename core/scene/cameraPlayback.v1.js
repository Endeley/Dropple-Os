import { selectActiveScene, selectActiveShot } from './selectors.v1.js';

export function resolveActiveCamera(project) {
    const scene = selectActiveScene(project);
    if (!scene) return null;

    const shot = selectActiveShot(project);
    if (!shot) return null;

    return shot.camera ?? null;
}

export function getCameraTransformAtTime(camera, time) {
    if (!camera?.keyframes?.length) return null;

    const frames = [...camera.keyframes].sort((a, b) => a.time - b.time);
    const first = frames[0];
    const last = frames[frames.length - 1];

    if (time <= first.time) return normalizeFrame(first);
    if (time >= last.time) return normalizeFrame(last);

    for (let i = 0; i < frames.length - 1; i += 1) {
        const a = frames[i];
        const b = frames[i + 1];
        if (time < a.time || time > b.time) continue;

        const span = b.time - a.time;
        const t = span === 0 ? 0 : (time - a.time) / span;

        return {
            x: lerp(a.x, b.x, t),
            y: lerp(a.y, b.y, t),
            zoom: lerp(a.zoom, b.zoom, t),
            rotation: lerp(a.rotation ?? 0, b.rotation ?? 0, t),
        };
    }

    return null;
}

function normalizeFrame(frame) {
    return {
        x: frame.x,
        y: frame.y,
        zoom: frame.zoom,
        rotation: frame.rotation ?? 0,
    };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}
