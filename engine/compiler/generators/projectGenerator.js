import { buildReactStyles } from '../targets/react/reactStyles.js';

export function generateProject(context) {
    const files = {};

    files['App.jsx'] = generateApp(context);
    files['routes.jsx'] = generateRoutes(context);
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

function generateApp(context) {
    const screens = Object.keys(context.screens || {}).sort();
    const imports = screens
        .map((screen) => `import ${screen} from "./screens/${screen}.jsx";`)
        .join('\n');
    const first = screens[0];
    const body = first ? `    <${first} />` : '    <div />';

    return `
import "./styles.css";
${imports ? `\n${imports}` : ''}

export default function App() {
  return (
${body}
  );
}
`.trimStart();
}

function generateRoutes(context) {
    const screens = Object.keys(context.screens || {}).sort();
    const imports = screens
        .map((screen) => `import ${screen} from "./screens/${screen}.jsx";`)
        .join('\n');
    const routes = screens
        .map((screen) => `  { path: "/${toRoutePath(screen)}", component: ${screen} },`)
        .join('\n');

    return `
${imports}

export const routes = [
${routes}
];
`.trimStart();
}

function toRoutePath(screen) {
    return screen.replace(/Screen$/, '').replace(/[A-Z]/g, (match, index) =>
        `${index === 0 ? '' : '-'}${match.toLowerCase()}`,
    );
}
