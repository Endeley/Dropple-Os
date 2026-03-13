import { buildPrimitiveAttributes, renderPrimitiveChildren } from './layoutPrimitives.js';

export function compileContainer(node, context, helpers = {}) {
    const indent = ' '.repeat((helpers.depth || 0) * 2);
    const layout = context.layout?.[node.id] || {};
    const children = renderPrimitiveChildren(node, context, helpers, helpers.depth || 0);
    const attributes = buildPrimitiveAttributes(node, context, {
        maxWidth: layout.maxWidth || '1200px',
        margin: '0 auto',
        width: layout.width || '100%',
        padding: typeof layout.padding === 'number' ? `${layout.padding}px` : layout.padding,
    });

    if (!children) {
        return `${indent}<div${attributes} />`;
    }

    return `${indent}<div${attributes}>\n${children}\n${indent}</div>`;
}
