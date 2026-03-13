import { resolveReactTag } from './reactComponents.js';
import { buildLayoutProps } from './reactLayout.js';
import { buildStyleClass } from './reactStyles.js';
import { compileLayoutPrimitive } from '../../layout/layoutPrimitives.js';
import { buildReactEventProps, buildReactInteractionMap } from './reactInteractions.js';

export function renderReactTree(structure, compilerContext) {
    const renderContext = {
        layout: compilerContext.layout || {},
        styles: compilerContext.styles || {},
        application: compilerContext.application || {},
        buildClassName: buildStyleClass,
    };
    const interactionMap = buildReactInteractionMap(renderContext);
    return structure
        .map((node) => renderNode(node, renderContext, interactionMap, 2))
        .join('\n');
}

function renderNode(node, context, interactionMap, depth) {
    const primitive = compileLayoutPrimitive(node, context, {
        depth,
        renderChild: (child, nextContext, nextDepth) =>
            renderNode(child, nextContext, interactionMap, nextDepth),
    });

    if (primitive) {
        return primitive;
    }

    const indent = ' '.repeat(depth * 2);
    const tag = resolveReactTag(node);
    const attributes = joinAttributes([
        `className="${buildStyleClass(node.id)}"`,
        buildLayoutProps(node.id, context.layout),
        buildReactEventProps(node.id, context, { interactionMap }),
    ]);
    const children = (node.children || [])
        .map((child) => renderNode(child, context, interactionMap, depth + 1))
        .join('\n');

    if (!children) {
        return `${indent}<${tag}${attributes} />`;
    }

    return `${indent}<${tag}${attributes}>\n${children}\n${indent}</${tag}>`;
}

function joinAttributes(parts) {
    const value = parts.filter(Boolean).join(' ');
    return value ? ` ${value}` : '';
}
