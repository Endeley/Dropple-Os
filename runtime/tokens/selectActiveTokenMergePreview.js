import { projectTokenMergePreview } from './projectTokenMergePreview.js';

export function selectActiveTokenMergePreview(state, options = {}) {
    return projectTokenMergePreview({
        tokenVersionGraph: state?.document?.tokenVersions,
        document: state?.document ?? null,
        events: state?.events ?? [],
        leftVersionId: options?.leftVersionId ?? null,
        rightVersionId: options?.rightVersionId ?? null,
        commonAncestorId: options?.commonAncestorId ?? null,
    });
}
