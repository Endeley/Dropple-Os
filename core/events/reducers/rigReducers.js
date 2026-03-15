import { EventTypes } from '../eventTypes.js';

function ensureRigState(state) {
    if (state?.document?.rigs) return state;

    return {
        ...state,
        document: {
            ...state.document,
            rigs: {
                rigs: {},
                activeRigId: null,
            },
        },
    };
}

function updateRigDocument(state, patch) {
    return {
        ...state,
        document: {
            ...state.document,
            rigs: {
                ...state.document.rigs,
                ...patch,
            },
        },
    };
}

export function rigReducers(state, event) {
    const ensured = ensureRigState(state);
    const rigState = ensured.document.rigs;
    const rigs = rigState.rigs || {};
    const { type, payload } = event;

    switch (type) {
        case EventTypes.RIG_CREATE: {
            const rig = payload?.rig;
            if (!rig?.id || rigs[rig.id]) return state;
            return updateRigDocument(ensured, {
                rigs: {
                    ...rigs,
                    [rig.id]: {
                        ...rig,
                        controllers: { ...(rig.controllers || {}) },
                        constraints: { ...(rig.constraints || {}) },
                        bones: { ...(rig.bones || {}) },
                    },
                },
                activeRigId: rigState.activeRigId ?? rig.id,
            });
        }

        case EventTypes.RIG_UPDATE: {
            const rigId = payload?.rigId;
            const patch = payload?.patch;
            if (!rigId || !patch || !rigs[rigId]) return state;

            return updateRigDocument(ensured, {
                rigs: {
                    ...rigs,
                    [rigId]: {
                        ...rigs[rigId],
                        ...patch,
                    },
                },
            });
        }

        case EventTypes.RIG_DELETE: {
            const rigId = payload?.rigId;
            if (!rigId || !rigs[rigId]) return state;

            const nextRigs = { ...rigs };
            delete nextRigs[rigId];

            return updateRigDocument(ensured, {
                rigs: nextRigs,
                activeRigId: rigState.activeRigId === rigId ? null : rigState.activeRigId,
            });
        }

        case EventTypes.RIG_SET_ACTIVE: {
            const rigId = payload?.rigId;
            if (rigId != null && !rigs[rigId]) return state;
            return updateRigDocument(ensured, {
                activeRigId: rigId ?? null,
            });
        }

        case EventTypes.RIG_CONTROLLER_CREATE: {
            const rigId = payload?.rigId;
            const controller = payload?.controller;
            if (!rigId || !controller?.id || !rigs[rigId] || rigs[rigId].controllers?.[controller.id]) return state;

            return updateRigDocument(ensured, {
                rigs: {
                    ...rigs,
                    [rigId]: {
                        ...rigs[rigId],
                        controllers: {
                            ...(rigs[rigId].controllers || {}),
                            [controller.id]: {
                                ...controller,
                                channels: Array.isArray(controller.channels) ? [...controller.channels] : [],
                            },
                        },
                    },
                },
            });
        }

        case EventTypes.RIG_CONTROLLER_UPDATE: {
            const rigId = payload?.rigId;
            const controllerId = payload?.controllerId;
            const patch = payload?.patch;
            const controller = rigs[rigId]?.controllers?.[controllerId];
            if (!rigId || !controllerId || !patch || !controller) return state;

            return updateRigDocument(ensured, {
                rigs: {
                    ...rigs,
                    [rigId]: {
                        ...rigs[rigId],
                        controllers: {
                            ...(rigs[rigId].controllers || {}),
                            [controllerId]: {
                                ...controller,
                                ...patch,
                            },
                        },
                    },
                },
            });
        }

        case EventTypes.RIG_CONTROLLER_DELETE: {
            const rigId = payload?.rigId;
            const controllerId = payload?.controllerId;
            if (!rigId || !controllerId || !rigs[rigId]?.controllers?.[controllerId]) return state;

            const nextControllers = { ...(rigs[rigId].controllers || {}) };
            delete nextControllers[controllerId];

            return updateRigDocument(ensured, {
                rigs: {
                    ...rigs,
                    [rigId]: {
                        ...rigs[rigId],
                        controllers: nextControllers,
                    },
                },
            });
        }

        case EventTypes.RIG_CONSTRAINT_CREATE: {
            const rigId = payload?.rigId;
            const constraint = payload?.constraint;
            if (!rigId || !constraint?.id || !rigs[rigId] || rigs[rigId].constraints?.[constraint.id]) return state;

            return updateRigDocument(ensured, {
                rigs: {
                    ...rigs,
                    [rigId]: {
                        ...rigs[rigId],
                        constraints: {
                            ...(rigs[rigId].constraints || {}),
                            [constraint.id]: { ...constraint },
                        },
                    },
                },
            });
        }

        case EventTypes.RIG_CONSTRAINT_UPDATE: {
            const rigId = payload?.rigId;
            const constraintId = payload?.constraintId;
            const patch = payload?.patch;
            const constraint = rigs[rigId]?.constraints?.[constraintId];
            if (!rigId || !constraintId || !patch || !constraint) return state;

            return updateRigDocument(ensured, {
                rigs: {
                    ...rigs,
                    [rigId]: {
                        ...rigs[rigId],
                        constraints: {
                            ...(rigs[rigId].constraints || {}),
                            [constraintId]: {
                                ...constraint,
                                ...patch,
                            },
                        },
                    },
                },
            });
        }

        case EventTypes.RIG_CONSTRAINT_DELETE: {
            const rigId = payload?.rigId;
            const constraintId = payload?.constraintId;
            if (!rigId || !constraintId || !rigs[rigId]?.constraints?.[constraintId]) return state;

            const nextConstraints = { ...(rigs[rigId].constraints || {}) };
            delete nextConstraints[constraintId];

            return updateRigDocument(ensured, {
                rigs: {
                    ...rigs,
                    [rigId]: {
                        ...rigs[rigId],
                        constraints: nextConstraints,
                    },
                },
            });
        }

        default:
            return state;
    }
}
