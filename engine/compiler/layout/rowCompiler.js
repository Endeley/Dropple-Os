import { compileFlexPrimitive } from './stackCompiler.js';

export function compileRow(node, context, helpers = {}) {
    return compileFlexPrimitive(node, context, helpers, 'row');
}
