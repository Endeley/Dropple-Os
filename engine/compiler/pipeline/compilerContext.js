export function createCompilerContext(ir, options = {}) {
    return {
        ir,
        target: options.target || 'react',

        structure: null,
        layout: null,
        styles: null,
        components: null,
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
