import { resolveReactTag } from './reactComponents.js';
import { buildLayoutProps } from './reactLayout.js';
import { buildStyleClass } from './reactStyles.js';
import { compileLayoutPrimitive } from '../../layout/layoutPrimitives.js';

export function renderReactTree(structure, layout, styles) {
    const context = {
        layout,
        styles,
        buildClassName: buildStyleClass,
    };
    return structure.map((node) => renderNode(node, context, 2)).join('\n');
}

function renderNode(node, context, depth) {
    const primitive = compileLayoutPrimitive(node, context, {
        depth,
        renderChild: (child, nextContext, nextDepth) => renderNode(child, nextContext, nextDepth),
    });

    if (primitive) {
        return primitive;
    }

    const indent = ' '.repeat(depth * 2);
    const tag = resolveReactTag(node);
    const attributes = joinAttributes([
        `className="${buildStyleClass(node.id)}"`,
        buildLayoutProps(node.id, context.layout),
    ]);
    const children = (node.children || [])
        .map((child) => renderNode(child, context, depth + 1))
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
