export function findBestSnap(value, candidates, threshold) {
    let best = null;

    for (const c of candidates) {
        const dist = Math.abs(c - value);
        if (dist <= threshold) {
            if (!best || dist < best.dist) {
                best = { value: c, dist };
            }
        }
    }

    return best;
}
