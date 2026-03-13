import { compileStack } from './stackCompiler.js';
import { compileRow } from './rowCompiler.js';
import { compileGrid } from './gridCompiler.js';
import { compileContainer } from './containerCompiler.js';
import { compileSpacer } from './spacerCompiler.js';

export const LayoutPrimitives = {
    Stack: compileStack,
    Row: compileRow,
    Grid: compileGrid,
    Container: compileContainer,
    Spacer: compileSpacer,
};

export function compileLayoutPrimitive(node, context, helpers = {}) {
    const compiler = LayoutPrimitives[resolvePrimitiveType(node, context)];

    if (!compiler) {
        return null;
    }

    return compiler(node, context, helpers);
}

export function isLayoutPrimitiveNode(node, context) {
    return Boolean(LayoutPrimitives[resolvePrimitiveType(node, context)]);
}

export function resolvePrimitiveType(node, context) {
    if (!node) {
        return null;
    }

    if (LayoutPrimitives[node.type]) {
        return node.type;
    }

    const layout = context?.layout?.[node.id];
    const type = layout?.type;
    if (!type) {
        return null;
    }

    const normalized = normalizePrimitiveName(type);
    return LayoutPrimitives[normalized] ? normalized : null;
}

export function renderPrimitiveChildren(node, context, helpers, depth) {
    const renderChild = helpers.renderChild || defaultRenderChild;
    return (node.children || [])
        .map((child) => renderChild(child, context, depth + 1))
        .join('\n');
}

export function buildPrimitiveAttributes(node, context, style) {
    const className = helpersClassName(node, helpersOptionalContext(context));
    const styleParts = Object.entries(style || {})
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}: ${formatJsxValue(value)}`);
    const parts = [];

    if (className) {
        parts.push(`className="${className}"`);
    }

    if (styleParts.length > 0) {
        parts.push(`style={{ ${styleParts.join(', ')} }}`);
    }

    return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

function defaultRenderChild() {
    return '';
}

function normalizePrimitiveName(type) {
    const value = String(type || '').toLowerCase();

    switch (value) {
        case 'stack':
            return 'Stack';
        case 'row':
            return 'Row';
        case 'grid':
            return 'Grid';
        case 'container':
            return 'Container';
        case 'spacer':
            return 'Spacer';
        default:
            return null;
    }
}

function helpersClassName(node, context) {
    return context?.buildClassName ? context.buildClassName(node.id) : null;
}

function helpersOptionalContext(context) {
    return context || {};
}

function formatJsxValue(value) {
    return typeof value === 'number' ? value : JSON.stringify(value);
}
