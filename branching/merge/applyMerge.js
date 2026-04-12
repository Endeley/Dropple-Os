// branching/merge/applyMerge.js

/**
 * Apply a merge plan into the active branch.
 *
 * 🔒 Uses dispatcher only
 * 🔒 No persistence writes
 */
export function applyMerge({ dispatcher, events }) {
    if (!dispatcher || !Array.isArray(events)) {
        throw new Error('applyMerge: invalid args');
    }

    for (const evt of events) {
        dispatcher.dispatch({
            id: evt.id,
            type: evt.type,
            payload: evt.payload,
            meta: {
                mergedFrom: evt.branchId ?? 'unknown',
            },
        });
    }
}
