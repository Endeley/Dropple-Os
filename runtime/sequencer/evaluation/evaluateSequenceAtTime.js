import { evaluateSequence } from './evaluateSequence.js';

function getSequenceMap(document) {
    return document?.sequences?.sequences ?? {};
}

function getAssets(document) {
    return document?.assets ?? null;
}

function resolveSequenceId(document, sequenceId) {
    if (sequenceId) return sequenceId;

    const activeSequenceId = document?.sequences?.activeSequenceId ?? null;
    if (activeSequenceId) return activeSequenceId;

    const ids = Object.keys(getSequenceMap(document)).sort();
    return ids.length === 1 ? ids[0] : null;
}

export function evaluateSequenceAtTime({ document, sequenceId = null, timeMs = null, frame = null } = {}) {
    const resolvedSequenceId = resolveSequenceId(document, sequenceId);
    const sequence = resolvedSequenceId ? getSequenceMap(document)[resolvedSequenceId] ?? null : null;

    return evaluateSequence({
        sequence,
        assets: getAssets(document),
        frame,
        timeMs,
    });
}
