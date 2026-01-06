// perf/perfTracker.js

const marks = new Map();
const stats = new Map();

/**
 * Start a performance mark.
 */
export function perfStart(label) {
    marks.set(label, performance.now());
}

/**
 * End a performance mark and record stats.
 */
export function perfEnd(label) {
    const start = marks.get(label);
    if (start == null) return null;

    const duration = performance.now() - start;
    marks.delete(label);

    const entry = stats.get(label) ?? {
        count: 0,
        total: 0,
        max: 0,
    };

    entry.count++;
    entry.total += duration;
    entry.max = Math.max(entry.max, duration);

    stats.set(label, entry);
    return duration;
}

/**
 * Get aggregated perf stats.
 */
export function getPerfStats() {
    const result = {};

    for (const [label, s] of stats.entries()) {
        result[label] = {
            count: s.count,
            avg: s.total / s.count,
            max: s.max,
        };
    }

    return result;
}

/**
 * Clear all stats.
 */
export function resetPerfStats() {
    stats.clear();
}
