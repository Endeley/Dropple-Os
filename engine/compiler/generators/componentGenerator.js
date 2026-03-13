import { resolveComponentName, resolveReactTag } from '../targets/react/reactComponents.js';
import { buildReactStyles, buildStyleClass } from '../targets/react/reactStyles.js';
import { buildLayoutProps } from '../targets/react/reactLayout.js';
import { compileLayoutPrimitive, isLayoutPrimitiveNode } from '../layout/layoutPrimitives.js';
import { buildReactEventProps, buildReactInteractionMap } from '../targets/react/reactInteractions.js';

export function generateComponents(context) {
    const structure = context.structure || [];
    const registry = new Map();
    const interactionMap = buildReactInteractionMap(context);

    for (const node of structure) {
        registerComponents(node, registry, context, interactionMap);
    }

    const components = Object.fromEntries(
        Array.from(registry.entries()).sort(([left], [right]) =>
            left.localeCompare(right),
        ),
    );

    context.components = components;

    return components;
}

function registerComponents(node, registry, context, interactionMap) {
    for (const child of node.children || []) {
        registerComponents(child, registry, context, interactionMap);
    }

    if (!isReusableComponentNode(node)) {
        return;
    }

    const name = resolveComponentName(node);
    if (registry.has(name)) {
        return;
    }

    registry.set(name, {
        jsx: generateComponentFile(name, node, context, interactionMap),
        css: buildNodeCss(node, context),
    });
}

function generateComponentFile(name, node, context, interactionMap) {
    const childComponents = collectChildComponentImports(node);
    const imports = ['import "./' + name + '.css";', ...childComponents].join('\n');
    const body = renderComponentNode(node, context, interactionMap, 2, true);

    return `
${imports}

export default function ${name}(props) {
  return (
${body}
  );
}
`.trimStart();
}

function collectChildComponentImports(node) {
    const imports = new Map();

    walkChildren(node.children || [], (child) => {
        if (!isReusableComponentNode(child)) {
            return;
        }

        const name = resolveComponentName(child);
        imports.set(
            name,
            `import ${name} from "../${name}/${name}.jsx";`,
        );
    });

    return Array.from(imports.values()).sort();
}

function renderComponentNode(node, context, interactionMap, depth, isRoot = false) {
    const primitive = compileLayoutPrimitive(node, {
        layout: context.layout || {},
        buildClassName: buildStyleClass,
    }, {
        depth,
        renderChild: (child, nextContext, nextDepth) =>
            renderComponentChild(
                child,
                { ...context, layout: nextContext.layout },
                interactionMap,
                nextDepth,
            ),
    });

    if (primitive) {
        return primitive;
    }

    const indent = ' '.repeat(depth * 2);
    const layoutProps = buildLayoutProps(node.id, context.layout || {});
    const className = buildStyleClass(node.id);
    const children = (node.children || [])
        .map((child) => renderComponentChild(child, context, interactionMap, depth + 1))
        .join('\n');
    const tag = isRoot ? 'div' : resolveReactTag(node);
    const attributes = joinAttributes([
        `className="${className}"`,
        layoutProps,
        isRoot ? '{...props}' : buildReactEventProps(node.id, context, {
            interactionMap,
            stateAccessor: 'props',
        }),
    ]);

    if (!children) {
        return `${indent}<${tag}${attributes} />`;
    }

    return `${indent}<${tag}${attributes}>\n${children}\n${indent}</${tag}>`;
}

function renderComponentChild(node, context, interactionMap, depth) {
    const indent = ' '.repeat(depth * 2);

    if (isLayoutPrimitiveNode(node, { layout: context.layout || {} })) {
        return renderComponentNode(node, context, interactionMap, depth, false);
    }

    if (isReusableComponentNode(node)) {
        const name = resolveComponentName(node);
        const eventProps = buildReactEventProps(node.id, context, {
            interactionMap,
            stateAccessor: 'props',
        });
        return `${indent}<${name}${eventProps ? ` ${eventProps}` : ''} />`;
    }

    return renderComponentNode(node, context, interactionMap, depth, false);
}

function buildNodeCss(node, context) {
    const css = buildReactStyles({
        [node.id]: context.styles?.[node.id] || {},
    });

    return css || `.${buildStyleClass(node.id)} {\n}\n`;
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

function isReusableComponentNode(node) {
    return Boolean(
        node &&
            node.type &&
            node.type !== 'screen' &&
            !isLayoutPrimitiveNode(node, { layout: { [node.id]: { type: node.type } } }),
    );
}
