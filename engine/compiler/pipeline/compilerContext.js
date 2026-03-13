export function createCompilerContext(ir, options = {}) {
    return {
        ir,
        target: options.target || 'react',

        structure: null,
        layout: null,
        styles: null,
        components: null,
        screens: null,
        designTokens: null,
        designComponents: null,
        designVariants: null,
        themes: null,
        bindings: null,
        interactions: null,
        navigation: null,
        state: null,

        files: {},
        assets: {},
        warnings: [],
        metadata: {},
    };
}
