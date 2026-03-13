const DEFAULT_BREAKPOINTS = Object.freeze({
    mobile: 480,
    tablet: 768,
    desktop: 1200,
});

export function compileBreakpoints(document = {}) {
    return {
        type: 'breakpoints',
        breakpoints: {
            ...DEFAULT_BREAKPOINTS,
            ...(document?.layout?.breakpoints ?? {}),
        },
    };
}

export { DEFAULT_BREAKPOINTS };
