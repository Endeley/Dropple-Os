import { buildReactDesignSystem } from './reactDesignSystemTarget.js';

export function generateReactDesignSystem(context) {
    return buildReactDesignSystem({
        tokens: context.designTokens || {},
        themes: context.themes || {},
        components: context.designComponents || {},
        workspace: context.workspace || context.options?.workspace || null,
    }).library;
}
