import { EventTypes } from '../eventTypes.js';

function ensureThemeState(state) {
    if (state?.document?.themes) {
        return state;
    }

    return {
        ...state,
        document: {
            ...state.document,
            themes: {
                activeThemeId: null,
                byId: {},
                order: [],
            },
        },
    };
}

function updateThemes(state, patch) {
    return {
        ...state,
        document: {
            ...state.document,
            themes: {
                ...state.document.themes,
                ...patch,
            },
        },
    };
}

export function themeReducers(state, event) {
    const ensured = ensureThemeState(state);
    const themes = ensured.document.themes;
    const byId = themes.byId ?? {};
    const order = Array.isArray(themes.order) ? themes.order : [];

    switch (event?.type) {
        case EventTypes.THEME_CREATE: {
            const theme = event?.payload?.theme ?? event?.payload ?? null;
            if (!theme?.id || byId[theme.id]) {
                return state;
            }

            const parentThemeId = theme.parentThemeId ?? null;
            if (parentThemeId != null && !byId[parentThemeId]) {
                return state;
            }

            return updateThemes(ensured, {
                byId: {
                    ...byId,
                    [theme.id]: {
                        id: theme.id,
                        label: theme.label ?? theme.id,
                        parentThemeId,
                        tokens: theme.tokens ?? {},
                        variants: theme.variants ?? {},
                    },
                },
                order: [...order, theme.id],
                activeThemeId: themes.activeThemeId ?? theme.id,
            });
        }

        case EventTypes.THEME_SWITCH: {
            const themeId = event?.payload?.themeId ?? null;
            if (themeId != null && !byId[themeId]) {
                return state;
            }

            return updateThemes(ensured, {
                activeThemeId: themeId,
            });
        }

        default:
            return state;
    }
}

