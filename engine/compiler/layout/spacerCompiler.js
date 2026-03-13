import { buildPrimitiveAttributes } from './layoutPrimitives.js';

export function compileSpacer(node, context, helpers = {}) {
    const indent = ' '.repeat((helpers.depth || 0) * 2);
    const layout = context.layout?.[node.id] || {};
    const attributes = buildPrimitiveAttributes(node, context, {
        width: typeof layout.width === 'number' ? `${layout.width}px` : layout.width,
        height:
            typeof (layout.size || layout.height || 16) === 'number'
                ? `${layout.size || layout.height || 16}px`
                : layout.size || layout.height || '16px',
        flexShrink: 0,
    });

    return `${indent}<div${attributes} />`;
}
