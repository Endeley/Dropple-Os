import { registerRuntimeInstrumentation } from '@/runtime/hooks/runtimeInstrumentation.js';
import { subscribePerfEvents } from './perfEvents.js';

const marks = new Map();
const stats = new Map();

function now() {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
}

function recordStat(label, duration) {
    const entry = stats.get(label) ?? {
        count: 0,
        total: 0,
        max: 0,
    };

    entry.count++;
    entry.total += duration;
    entry.max = Math.max(entry.max, duration);

    stats.set(label, entry);
}

/**
 * Start a performance mark.
 */
export function perfStart(label) {
    marks.set(label, now());
}

/**
 * End a performance mark and record stats.
 */
export function perfEnd(label) {
    const start = marks.get(label);
    if (start == null) return null;

    const duration = now() - start;
    marks.delete(label);

    recordStat(label, duration);
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

export function trackPerf(label, durationOverride = null) {
    if (typeof durationOverride === 'number') {
        recordStat(label, durationOverride);
        return durationOverride;
    }

    perfStart(label);
    return perfEnd(label);
}

subscribePerfEvents((event) => {
    const { type, label, duration } = event || {};
    if (!label) return;

    if (type === 'start') {
        marks.set(label, now());
        return;
    }

    if (type === 'end') {
        const measured =
            typeof duration === 'number'
                ? duration
                : (() => {
                      const start = marks.get(label);
                      if (start == null) return null;
                      return now() - start;
                  })();

        if (measured == null) return;
        marks.delete(label);
        recordStat(label, measured);
        return;
    }

    if (type === 'measure' && typeof duration === 'number') {
        recordStat(label, duration);
    }
});

registerRuntimeInstrumentation({
    onInterpolate() {
        const start = now();
        return () => {
            const duration = now() - start;
            trackPerf('interpolate', duration);
        };
    },
});
