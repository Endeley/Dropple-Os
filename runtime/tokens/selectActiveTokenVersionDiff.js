import { projectTokenVersionDiff } from './projectTokenVersionDiff.js';

export function selectActiveTokenVersionDiff(state, options = {}) {
    return projectTokenVersionDiff({
        tokenVersionGraph: state?.document?.tokenVersions,
        document: state?.document ?? null,
        events: state?.events ?? [],
        baseVersionId: options?.baseVersionId ?? null,
        compareVersionId: options?.compareVersionId ?? null,
    });
}
