import { evaluateSequence } from '../../sequencer/evaluation/evaluateSequence.js';

function resolveExportedSequenceId(mediaExport, sequenceId = null) {
    if (sequenceId) return sequenceId;

    const activeSequenceId = mediaExport?.sequences?.activeSequenceId ?? null;
    if (activeSequenceId) return activeSequenceId;

    const sequenceIds = Object.keys(mediaExport?.sequences?.sequences ?? {}).sort();
    return sequenceIds.length === 1 ? sequenceIds[0] : null;
}

export function evaluateExportedMediaAt({
    mediaExport,
    sequenceId = null,
    timeMs = null,
    frame = null,
} = {}) {
    const resolvedSequenceId = resolveExportedSequenceId(mediaExport, sequenceId);
    const sequence = resolvedSequenceId
        ? mediaExport?.sequences?.sequences?.[resolvedSequenceId] ?? null
        : null;

    return evaluateSequence({
        sequence,
        assets: mediaExport?.assets ?? null,
        timeMs,
        frame,
    });
}
