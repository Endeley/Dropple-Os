import { buildReactStyles } from '../targets/react/reactStyles.js';
import { buildReactState, buildReactStateProps } from '../targets/react/reactState.js';
import { buildReactNavigation } from '../targets/react/reactNavigation.js';

export function generateProject(context) {
    const files = {};
    const navigation = buildReactNavigation(context, {
        routeProps: buildReactStateProps(context, 'local'),
    });

    files['App.jsx'] = generateApp(context, navigation);
    files['routes.jsx'] = generateRoutes(navigation);
    files['styles.css'] = buildReactStyles(context.styles || {});

    for (const [name, component] of Object.entries(context.components || {})) {
        files[`components/${name}/${name}.jsx`] = component.jsx;
        files[`components/${name}/${name}.css`] = component.css;
    }

    for (const [screen, source] of Object.entries(context.screens || {})) {
        files[`screens/${screen}.jsx`] = source;
    }

    context.files = files;

    return files;
}

function generateApp(context, navigation) {
    const stateCode = buildReactState(context);
    const fallback = Object.keys(context.screens || {}).sort()[0];
    const body = navigation.routes.length
        ? navigation.router
        : fallback
            ? `    <${fallback} ${buildReactStateProps(context, 'local')} />`
            : '    <div />';

    return `
import React from "react";
${navigation.routes.length ? 'import { BrowserRouter, Routes, Route } from "react-router-dom";\n' : ''}${navigation.imports ? `${navigation.imports}\n` : ''}import "./styles.css";

export default function App() {
  ${stateCode || ''}
  return (
${body}
  );
}
`.trimStart();
}

function generateRoutes(navigation) {
    const imports = navigation.imports;
    const routes = navigation.routes
        .map((route) => `  { id: "${route.id}", path: "${route.path}", component: ${route.component} },`)
        .join('\n');

    return `
${imports}

export const routes = [
${routes}
];
`.trimStart();
}
