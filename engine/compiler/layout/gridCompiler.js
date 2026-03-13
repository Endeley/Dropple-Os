import { buildPrimitiveAttributes, renderPrimitiveChildren } from './layoutPrimitives.js';

export function compileGrid(node, context, helpers = {}) {
    const indent = ' '.repeat((helpers.depth || 0) * 2);
    const layout = context.layout?.[node.id] || {};
    const columns = layout.columns || 2;
    const children = renderPrimitiveChildren(node, context, helpers, helpers.depth || 0);
    const attributes = buildPrimitiveAttributes(node, context, {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: typeof layout.gap === 'number' ? `${layout.gap}px` : layout.gap,
    });

    if (!children) {
        return `${indent}<div${attributes} />`;
    }

    return `${indent}<div${attributes}>\n${children}\n${indent}</div>`;
}
