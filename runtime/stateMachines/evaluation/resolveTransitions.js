function readParameterValue(parameters, key) {
    if (!key) return undefined;
    return parameters?.[key];
}

function evaluateCondition(condition, parameters) {
    if (!condition) return false;
    if (typeof condition === 'function') return Boolean(condition(parameters));
    if (typeof condition !== 'object') return false;

    const actual = readParameterValue(parameters, condition.parameter);
    const expected = condition.value;

    switch (condition.operator) {
        case '===':
            return actual === expected;
        case '!==':
            return actual !== expected;
        case '>':
            return Number(actual) > Number(expected);
        case '>=':
            return Number(actual) >= Number(expected);
        case '<':
            return Number(actual) < Number(expected);
        case '<=':
            return Number(actual) <= Number(expected);
        case 'truthy':
            return Boolean(actual);
        case 'falsy':
            return !actual;
        default:
            return false;
    }
}

export function resolveTransitions(machine, {
    activeStateId = machine?.entryState ?? null,
    parameters = machine?.parameters ?? {},
} = {}) {
    if (!machine || !activeStateId) return null;

    const transitions = Array.isArray(machine.transitions) ? machine.transitions : [];

    for (const transition of transitions) {
        if (transition?.from !== activeStateId) continue;
        if (!evaluateCondition(transition.condition, parameters)) continue;
        return transition;
    }

    return null;
}
