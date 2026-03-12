import { resolveBindings } from './bindings.js';
import { resolveComputedValues } from './computedValues.js';

export function evaluateData(document, runtime) {
    const variables = document?.variables ?? {};
    const bindings = document?.bindings ?? {};
    const resolvedBindings = resolveBindings(bindings, variables);
    const resolvedValues = resolveComputedValues(resolvedBindings);

    return {
        ...runtime,
        data: {
            resolvedBindings,
            resolvedValues,
        },
    };
}
