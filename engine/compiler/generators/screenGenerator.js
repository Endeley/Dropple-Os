import { resolveComponentName, resolveScreenName } from '../targets/react/reactComponents.js';
import { buildLayoutProps } from '../targets/react/reactLayout.js';
import { buildStyleClass } from '../targets/react/reactStyles.js';
import { resolveReactTag } from '../targets/react/reactComponents.js';

export function generateScreens(context) {
    const screens = {};
    const rootNodes = (context.structure || []).filter((node) => node.type === 'screen');

    for (const screen of rootNodes) {
        const name = resolveScreenName(screen.id);
        screens[name] = generateScreenFile(name, screen, context);
    }

    context.screens = screens;

    return screens;
}

function generateScreenFile(name, screen, context) {
    const componentImports = collectComponentImports(screen);
    const imports = componentImports.join('\n');
    const body = renderScreenNode(screen, context, 2, true);

    return `
${imports}

export default function ${name}() {
  return (
${body}
  );
}
`.trimStart();
}

function collectComponentImports(screen) {
    const imports = new Map();

    walkChildren(screen.children || [], (child) => {
        if (child.type === 'screen') {
            return;
        }

        const name = resolveComponentName(child);
        imports.set(name, `import ${name} from "../components/${name}/${name}.jsx";`);
    });

    return Array.from(imports.values()).sort();
}

function renderScreenNode(node, context, depth, isRoot = false) {
    const indent = ' '.repeat(depth * 2);
    const children = (node.children || [])
        .map((child) => renderScreenChild(child, context, depth + 1))
        .join('\n');
    const className = buildStyleClass(node.id);
    const layoutProps = buildLayoutProps(node.id, context.layout || {});
    const tag = isRoot ? 'div' : resolveReactTag(node);
    const attributes = joinAttributes([
        `className="${className}"`,
        layoutProps,
    ]);

    if (!children) {
        return `${indent}<${tag}${attributes} />`;
    }

    return `${indent}<${tag}${attributes}>\n${children}\n${indent}</${tag}>`;
}

function renderScreenChild(node, context, depth) {
    const indent = ' '.repeat(depth * 2);
    const name = resolveComponentName(node);
    return `${indent}<${name} />`;
}

function walkChildren(children, visitor) {
    for (const child of children) {
        visitor(child);
        walkChildren(child.children || [], visitor);
    }
}

function joinAttributes(parts) {
    const value = parts.filter(Boolean).join(' ');
    return value ? ` ${value}` : '';
}
