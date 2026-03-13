const marks = new Map();

export function perfStart(label) {
    marks.set(label, performance.now());
}

export function perfEnd(label) {
    const start = marks.get(label);
    if (!Number.isFinite(start)) {
        return 0;
    }

    marks.delete(label);
    return performance.now() - start;
}
