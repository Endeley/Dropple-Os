export function buildReactNavigation(context, options = {}) {
    const nav = context.application?.navigation || { routes: [] };
    const routes = nav.routes?.length ? nav.routes : buildFallbackRoutes(context);
    const routeProps = options.routeProps ? ` ${options.routeProps}` : '';
    const imports = routes
        .map((route) => `import ${route.component} from "./screens/${route.component}.jsx";`)
        .join('\n');
    const routeElements = routes
        .map(
            (route) =>
                `        <Route path="${route.path}" element={<${route.component}${routeProps} />} />`,
        )
        .join('\n');

    return {
        imports,
        routes,
        router: `
    <BrowserRouter>
      <Routes>
${routeElements}
      </Routes>
    </BrowserRouter>`,
    };
}

function buildFallbackRoutes(context) {
    return Object.keys(context.screens || {})
        .sort()
        .map((screenName) => ({
            id: toRouteId(screenName),
            component: screenName,
            path: toRoutePath(screenName),
        }));
}

function toRouteId(screenName) {
    return screenName.replace(/Screen$/, '').toLowerCase();
}

function toRoutePath(screenName) {
    const base = screenName.replace(/Screen$/, '');
    const slug = base.replace(/[A-Z]/g, (match, index) =>
        `${index === 0 ? '' : '-'}${match.toLowerCase()}`,
    );
    return slug ? `/${slug}` : '/';
}
