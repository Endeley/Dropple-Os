import { EventTypes } from '../eventTypes.js';
import {
    appendTokenVersion,
    normalizeParentVersionIds,
    rollbackTokenVersion,
    validateMergeLegality,
} from '@/core/events/tokenVersionGraph.js';

function ensureTokenVersionState(state) {
    if (state?.document?.tokenVersions) {
        return state;
    }

    return {
        ...state,
        document: {
            ...state.document,
            tokenVersions: {
                entries: {},
                order: [],
                activeVersionId: null,
            },
        },
    };
}

export function tokenVersionReducers(state, event) {
    const ensured = ensureTokenVersionState(state);
    const payload = event?.payload ?? {};
    let nextTokenVersions = ensured.document.tokenVersions;

    switch (event?.type) {
        case EventTypes.TOKEN_VERSION_TAG: {
            nextTokenVersions = appendTokenVersion(ensured.document.tokenVersions, {
                id: payload?.versionId ?? payload?.id ?? null,
                label: payload?.label ?? null,
                themeId: payload?.themeId ?? null,
                timestamp: payload?.timestamp ?? null,
                operation: 'tag',
                parentVersionIds: normalizeParentVersionIds(
                    payload?.parentVersionIds ??
                        (payload?.parentId ? [payload.parentId] : []),
                ),
            });
            break;
        }

        case EventTypes.TOKEN_VERSION_FORK: {
            nextTokenVersions = appendTokenVersion(ensured.document.tokenVersions, {
                id: payload?.versionId ?? null,
                label: payload?.label ?? null,
                themeId: payload?.themeId ?? null,
                timestamp: payload?.timestamp ?? null,
                operation: 'fork',
                parentVersionIds: normalizeParentVersionIds([
                    payload?.parentVersionId ?? null,
                ]),
            });
            break;
        }

        case EventTypes.TOKEN_VERSION_MERGE: {
            const legality = validateMergeLegality(
                ensured.document.tokenVersions,
                payload?.parentVersionIds,
            );
            if (!legality.ok) {
                return state;
            }

            nextTokenVersions = appendTokenVersion(ensured.document.tokenVersions, {
                id: payload?.versionId ?? null,
                label: payload?.label ?? null,
                themeId: payload?.themeId ?? null,
                timestamp: payload?.timestamp ?? null,
                operation: 'merge',
                parentVersionIds: legality.parentVersionIds,
            });
            break;
        }

        case EventTypes.TOKEN_VERSION_ROLLBACK: {
            nextTokenVersions = rollbackTokenVersion(
                ensured.document.tokenVersions,
                payload?.rollbackTargetId ?? null,
            );
            break;
        }

        default:
            return state;
    }

    if (nextTokenVersions === ensured.document.tokenVersions) {
        return state;
    }

    return {
        ...state,
        document: {
            ...state.document,
            tokenVersions: nextTokenVersions,
        },
    };
}
