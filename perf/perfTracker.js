// perf/perfTracker.js
const marks = new Map();

export function perfStart(label) {
    marks.set(label, performance.now());
}

export function perfEnd(label) {
    const start = marks.get(label);
    if (start == null) return;

    const duration = performance.now() - start;
    marks.delete(label);
    return duration;
}
