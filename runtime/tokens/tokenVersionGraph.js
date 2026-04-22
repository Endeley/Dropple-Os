export {
    appendTokenVersion,
    cloneVersionEntry,
    detectCycles,
    isAncestorVersion,
    normalizeParentVersionIds,
    resolveActiveVersionHead,
    rollbackTokenVersion,
    topologicalOrderVersions,
    validateMergeLegality,
    validateVersionGraph,
} from '@/core/events/tokenVersionGraph.js';
