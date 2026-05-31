import { EventTypes } from '@/core/events/eventTypes.js';

export function projectBootstrapReducers(state, event) {
    if (event?.type !== EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP) {
        return state;
    }

    const payload = event?.payload ?? {};
    const previousMeta = state?.document?.meta ?? {};

    return {
        ...state,
        document: {
            ...state.document,
            meta: {
                ...previousMeta,
                projectBootstrap: {
                    schemaVersion: 1,
                    projectId: payload.projectId ?? null,
                    projectName: payload.projectName ?? null,
                    defaultPerspectiveId: payload.defaultPerspectiveId ?? null,
                    blueprintId: payload.blueprintId ?? null,
                    blueprintVersionId: payload.blueprintVersionId ?? null,
                },
            },
        },
    };
}
