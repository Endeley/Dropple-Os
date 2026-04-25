import { EventTypes } from '@/core/events/eventTypes.js';
import { normalizeExportTarget } from '@/core/export/exportTargetContract.js';

function ensureExportState(state) {
    if (state?.document?.exports) return state;

    return {
        ...state,
        document: {
            ...state.document,
            exports: {
                targets: [],
            },
        },
    };
}

export function exportReducers(state, event) {
    switch (event?.type) {
        case EventTypes.EXPORT_TARGET_UPSERT: {
            const nextState = ensureExportState(state);
            const nextTarget = normalizeExportTarget(event?.payload?.target);
            const targets = Array.isArray(nextState.document.exports?.targets)
                ? nextState.document.exports.targets
                : [];

            return {
                ...nextState,
                document: {
                    ...nextState.document,
                    exports: {
                        ...nextState.document.exports,
                        targets: [...targets.filter((target) => target?.id !== nextTarget.id), nextTarget].sort((left, right) =>
                            String(left?.id ?? '').localeCompare(String(right?.id ?? '')),
                        ),
                    },
                },
            };
        }

        case EventTypes.EXPORT_TARGET_DELETE: {
            const targetId = event?.payload?.targetId;
            if (!targetId) return state;

            const nextState = ensureExportState(state);
            const targets = Array.isArray(nextState.document.exports?.targets)
                ? nextState.document.exports.targets
                : [];

            return {
                ...nextState,
                document: {
                    ...nextState.document,
                    exports: {
                        ...nextState.document.exports,
                        targets: targets.filter((target) => target?.id !== targetId),
                    },
                },
            };
        }

        default:
            return state;
    }
}
