import { renderReactTree } from './reactRenderer.js';
import { buildReactStyles } from './reactStyles.js';

export function reactTarget(context) {
    const jsxTree = renderReactTree(
        context.structure || [],
        context.layout || {},
        context.styles || {},
    );
    const css = buildReactStyles(context.styles || {});

    context.files['App.jsx'] = generateAppComponent(jsxTree);
    context.files['styles.css'] = css;

    return context;
}

function generateAppComponent(tree) {
    return `
import "./styles.css";

export default function App() {
  return (
${tree || '    <div />'}
  );
}
`;
}
