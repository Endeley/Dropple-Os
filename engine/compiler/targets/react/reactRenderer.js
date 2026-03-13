import { resolveReactTag } from './reactComponents.js';
import { buildLayoutProps } from './reactLayout.js';
import { buildStyleClass } from './reactStyles.js';

export function renderReactTree(structure, layout, styles) {
    return structure.map((node) => renderNode(node, layout, styles, 2)).join('\n');
}

function renderNode(node, layout, styles, depth) {
    const indent = ' '.repeat(depth * 2);
    const tag = resolveReactTag(node);
    const attributes = joinAttributes([
        `className="${buildStyleClass(node.id)}"`,
        buildLayoutProps(node.id, layout),
    ]);
    const children = (node.children || [])
        .map((child) => renderNode(child, layout, styles, depth + 1))
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
