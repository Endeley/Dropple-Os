import { buildPrimitiveAttributes, renderPrimitiveChildren } from './layoutPrimitives.js';

export function compileStack(node, context, helpers = {}) {
    return compileFlexPrimitive(node, context, helpers, 'column');
}

export function compileFlexPrimitive(node, context, helpers, direction) {
    const indent = ' '.repeat((helpers.depth || 0) * 2);
    const layout = context.layout?.[node.id] || {};
    const children = renderPrimitiveChildren(node, context, helpers, helpers.depth || 0);
    const attributes = buildPrimitiveAttributes(node, context, {
        display: 'flex',
        flexDirection: direction,
        gap: px(layout.gap),
        alignItems: toAlignItems(layout.align),
        justifyContent: toJustifyContent(layout.justify),
        width: layout.width,
        height: layout.height,
    });

    if (!children) {
        return `${indent}<div${attributes} />`;
    }

    return `${indent}<div${attributes}>\n${children}\n${indent}</div>`;
}

function px(value) {
    return typeof value === 'number' ? `${value}px` : value;
}

function toAlignItems(value) {
    if (value === 'start') return 'flex-start';
    if (value === 'end') return 'flex-end';
    return value || undefined;
}

function toJustifyContent(value) {
    if (value === 'start') return 'flex-start';
    if (value === 'end') return 'flex-end';
    return value || undefined;
}
