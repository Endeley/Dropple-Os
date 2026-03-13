export function responsiveLayoutRuntime(width, breakpoints = {}, responsiveRules = []) {
    let current = 'desktop';

    if (Number.isFinite(width) && width <= (breakpoints.mobile ?? 480)) {
        current = 'mobile';
    } else if (Number.isFinite(width) && width <= (breakpoints.tablet ?? 768)) {
        current = 'tablet';
    }

    const resolved = {};

    for (const rule of responsiveRules) {
        const nodeRules = rule?.rules?.[current];
        if (!nodeRules) continue;
        resolved[rule.nodeId] = { ...nodeRules };
    }

    return resolved;
}
