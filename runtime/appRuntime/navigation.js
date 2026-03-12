export function resolveNavigation(app) {
    const screens = app?.screens ?? {};
    const currentScreen = app?.currentScreen ?? null;
    const resolvedScreen =
        currentScreen && screens[currentScreen] ? screens[currentScreen] : null;

    return {
        screens,
        currentScreen,
        resolvedScreen,
        flows: app?.flows ?? {},
    };
}
