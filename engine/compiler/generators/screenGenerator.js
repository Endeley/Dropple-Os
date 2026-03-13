import { resolveComponentName, resolveScreenName } from '../targets/react/reactComponents.js';
import { buildLayoutProps } from '../targets/react/reactLayout.js';
import { buildStyleClass } from '../targets/react/reactStyles.js';
import { resolveReactTag } from '../targets/react/reactComponents.js';
import { compileLayoutPrimitive, isLayoutPrimitiveNode } from '../layout/layoutPrimitives.js';
import { buildReactEventProps, buildReactInteractionMap } from '../targets/react/reactInteractions.js';

export function generateScreens(context) {
    const screens = {};
    const rootNodes = (context.structure || []).filter((node) => node.type === 'screen');
    const interactionMap = buildReactInteractionMap(context);

    for (const screen of rootNodes) {
        const name = resolveScreenName(screen.id);
        screens[name] = generateScreenFile(name, screen, context, interactionMap);
    }

    context.screens = screens;

    return screens;
}

function generateScreenFile(name, screen, context, interactionMap) {
    const componentImports = collectComponentImports(screen, context);
    const imports = componentImports.join('\n');
    const body = renderScreenNode(screen, context, interactionMap, 2, true);
    const needsNavigate = Object.values(interactionMap).some((items) =>
        items.some((interaction) => interaction.action?.type === 'navigate'),
    );

    return `
${needsNavigate ? 'import { useNavigate } from "react-router-dom";\n' : ''}${imports}
export default function ${name}(props) {
  ${needsNavigate ? 'const navigate = useNavigate();' : ''}
  return (
${body}
  );
}
`.trimStart();
}

function collectComponentImports(screen, context) {
    const imports = new Map();

    walkChildren(screen.children || [], (child) => {
        if (child.type === 'screen') {
            return;
        }

        if (isLayoutPrimitiveNode(child, { layout: context.layout || {} })) {
            return;
        }

        const name = resolveComponentName(child);
        imports.set(name, `import ${name} from "../components/${name}/${name}.jsx";`);
    });

    return Array.from(imports.values()).sort();
}

function renderScreenNode(node, context, interactionMap, depth, isRoot = false) {
    const primitive = compileLayoutPrimitive(node, {
        layout: context.layout || {},
        buildClassName: buildStyleClass,
    }, {
        depth,
        renderChild: (child, nextContext, nextDepth) =>
            renderScreenChild(
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
    const children = (node.children || [])
        .map((child) => renderScreenChild(child, context, interactionMap, depth + 1))
        .join('\n');
    const className = buildStyleClass(node.id);
    const layoutProps = buildLayoutProps(node.id, context.layout || {});
    const tag = isRoot ? 'div' : resolveReactTag(node);
    const attributes = joinAttributes([
        `className="${className}"`,
        layoutProps,
        buildReactEventProps(node.id, context, {
            interactionMap,
            stateAccessor: 'props',
        }),
    ]);

    if (!children) {
        return `${indent}<${tag}${attributes} />`;
    }

    return `${indent}<${tag}${attributes}>\n${children}\n${indent}</${tag}>`;
}

function renderScreenChild(node, context, interactionMap, depth) {
    const indent = ' '.repeat(depth * 2);

    if (isLayoutPrimitiveNode(node, { layout: context.layout || {} })) {
        return renderScreenNode(node, context, interactionMap, depth, false);
    }

    const name = resolveComponentName(node);
    const eventProps = buildReactEventProps(node.id, context, {
        interactionMap,
        stateAccessor: 'props',
    });
    return `${indent}<${name}${eventProps ? ` ${eventProps}` : ''} />`;
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
