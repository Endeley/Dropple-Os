export function compileVariants(context) {
    const variants = {};

    for (const [name, component] of Object.entries(context.designComponents || {})) {
        variants[name] = Object.keys(component.variants || {}).sort();
    }

    context.designVariants = variants;

    return variants;
}
