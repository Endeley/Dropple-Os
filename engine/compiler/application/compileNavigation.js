export function compileNavigation(context) {
    const navigation = context.ir?.navigation || {};

    const routes = (navigation.routes || [])
        .slice()
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((route) => ({
            id: route.id,
            component: route.component,
            path: route.path,
        }));

    const compiled = {
        initialRoute: navigation.initialRoute || routes[0]?.id || null,
        routes,
    };

    context.application.navigation = compiled;
    context.navigation = compiled;

    return compiled;
}
