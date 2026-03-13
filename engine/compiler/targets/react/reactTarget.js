import { renderReactTree } from './reactRenderer.js';
import { buildReactStyles } from './reactStyles.js';
import { buildReactState, buildReactStateProps } from './reactState.js';
import { buildReactNavigation } from './reactNavigation.js';

export function reactTarget(context) {
    const jsxTree = renderReactTree(context.structure || [], context);
    const css = buildReactStyles(context.styles || {});
    const stateCode = buildReactState(context);
    const navigation = buildReactNavigation(context, {
        routeProps: buildReactStateProps(context, 'local'),
    });

    context.files['App.jsx'] = generateAppComponent(jsxTree, stateCode, navigation);
    context.files['styles.css'] = css;
    context.files['routes.jsx'] = generateRoutesModule(navigation);

    return context;
}

function generateAppComponent(tree, stateCode, navigation) {
    return `
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
${navigation.imports}
import "./styles.css";

export default function App() {
  ${stateCode || ''}
  return (
${navigation.routes.length ? navigation.router : tree || '    <div />'}
  );
}
`;
}

function generateRoutesModule(navigation) {
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
