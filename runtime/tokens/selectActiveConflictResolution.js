import { projectTokenConflictResolutions } from './projectTokenConflictResolutions.js';
import { selectActiveTokenMergePreview } from './selectActiveTokenMergePreview.js';

export function selectActiveConflictResolution(state, options = {}) {
    const mergePreview =
        options?.mergePreview ??
        selectActiveTokenMergePreview(state, {
            leftVersionId: options?.leftVersionId ?? null,
            rightVersionId: options?.rightVersionId ?? null,
            commonAncestorId: options?.commonAncestorId ?? null,
        });

    return projectTokenConflictResolutions({
        mergePreview,
        selectedResolutionChoices: options?.selectedResolutionChoices ?? {},
    });
}
