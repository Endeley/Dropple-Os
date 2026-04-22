import { EventTypes } from '../eventTypes.js';
import {
    deleteValueAtPath,
    setValueAtPath,
    toPathSegments,
} from './tokenReducerUtils.js';

function updateDocument(state, patch) {
    return {
        ...state,
        document: {
            ...state.document,
            ...patch,
        },
    };
}

function resolveScopedTokenRoot(document, payload) {
    const scope = payload?.scope ?? 'global';

    if (scope === 'global') {
        return {
            ok: true,
            current: document?.tokens ?? {},
            commit(nextRoot) {
                return { tokens: nextRoot };
            },
        };
    }

    if (scope === 'theme') {
        const themeId = payload?.themeId;
        const theme = themeId ? document?.themes?.byId?.[themeId] : null;
        if (!theme) return { ok: false };

        return {
            ok: true,
            current: theme.tokens ?? {},
            commit(nextRoot) {
                return {
                    themes: {
                        ...document.themes,
                        byId: {
                            ...(document.themes?.byId ?? {}),
                            [themeId]: {
                                ...theme,
                                tokens: nextRoot,
                            },
                        },
                    },
                };
            },
        };
    }

    if (scope === 'variant') {
        const themeId = payload?.themeId;
        const variantId = payload?.variantId;
        const theme = themeId ? document?.themes?.byId?.[themeId] : null;
        const variant = variantId ? theme?.variants?.[variantId] : null;
        if (!theme || !variant) return { ok: false };

        return {
            ok: true,
            current: variant.tokens ?? {},
            commit(nextRoot) {
                return {
                    themes: {
                        ...document.themes,
                        byId: {
                            ...(document.themes?.byId ?? {}),
                            [themeId]: {
                                ...theme,
                                variants: {
                                    ...(theme.variants ?? {}),
                                    [variantId]: {
                                        ...variant,
                                        tokens: nextRoot,
                                    },
                                },
                            },
                        },
                    },
                };
            },
        };
    }

    return { ok: false };
}

function applyScopedWrite(state, payload, mode, value) {
    const document = state?.document ?? {};
    const path = toPathSegments(payload?.tokenPath);
    if (path.length === 0) return state;

    const scoped = resolveScopedTokenRoot(document, payload);
    if (!scoped.ok) return state;

    const nextRoot =
        mode === 'delete'
            ? deleteValueAtPath(scoped.current, path)
            : setValueAtPath(scoped.current, path, value, mode);

    if (nextRoot === scoped.current) {
        return state;
    }

    return updateDocument(state, scoped.commit(nextRoot));
}

export function tokenReducers(state, event) {
    switch (event?.type) {
        case EventTypes.TOKEN_CREATE:
            return applyScopedWrite(state, event?.payload, 'create', event?.payload?.value);

        case EventTypes.TOKEN_SET:
            return applyScopedWrite(state, event?.payload, 'upsert', event?.payload?.value);

        case EventTypes.TOKEN_DELETE:
            return applyScopedWrite(state, event?.payload, 'delete');

        case EventTypes.TOKEN_ALIAS_SET:
            if (typeof event?.payload?.targetPath !== 'string' || event.payload.targetPath.length === 0) {
                return state;
            }

            return applyScopedWrite(state, event.payload, 'upsert', {
                type: 'token',
                value: event.payload.targetPath,
            });

        default:
            return state;
    }
}

