export function resolveAppState(app) {
    return {
        state: app?.state ?? {},
    };
}
