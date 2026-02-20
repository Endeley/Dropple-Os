function toFiniteTime(value) {
    return Number.isFinite(value) ? value : null;
}

export function dedupeAndSortTimes(times) {
    const unique = new Set();
    (times || []).forEach((time) => {
        const value = toFiniteTime(time);
        if (value == null) return;
        unique.add(value);
    });
    return Array.from(unique).sort((a, b) => a - b);
}

export function collectKeyframeTimes(animations) {
    if (!animations?.keyframes) return [];
    return dedupeAndSortTimes(
        Object.values(animations.keyframes).map((kf) => kf?.timeMs)
    );
}

export function getPrevKeyframeTime(times, time) {
    const list = times || [];
    for (let i = list.length - 1; i >= 0; i -= 1) {
        if (list[i] <= time) return list[i];
    }
    return null;
}

export function getNextKeyframeTime(times, time) {
    const list = times || [];
    for (let i = 0; i < list.length; i += 1) {
        if (list[i] > time) return list[i];
    }
    return null;
}

export function getNearestKeyframeTime(times, time, threshold) {
    const list = times || [];
    if (!list.length) return null;
    let best = null;
    let bestDist = Infinity;
    for (let i = 0; i < list.length; i += 1) {
        const dist = Math.abs(list[i] - time);
        if (dist < bestDist) {
            bestDist = dist;
            best = list[i];
        }
    }
    if (Number.isFinite(threshold) && bestDist <= threshold) return best;
    return null;
}
