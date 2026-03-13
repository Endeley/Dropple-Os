export function resolveNavigation(app, runtime) {
    const screens = app?.screens ?? {};
    const runtimeNavigation = runtime?.navigation ?? {};
    const firstGraph = Object.values(runtimeNavigation)[0] ?? null;
    const currentScreen = firstGraph?.current ?? app?.currentScreen ?? null;
    const resolvedScreen =
        currentScreen && screens[currentScreen] ? screens[currentScreen] : null;

    return {
        screens,
        currentScreen,
        resolvedScreen,
        flows: app?.flows ?? {},
        navigation: runtimeNavigation,
    };
}
