export function compileWorkflows(context) {
    const workflows = Array.isArray(context.ir?.workflows)
        ? context.ir.workflows
        : [];

    const normalized = workflows
        .slice()
        .sort((left, right) => left.id.localeCompare(right.id))
        .map(normalizeWorkflow);

    context.application.workflows = normalized;

    return normalized;
}

function normalizeWorkflow(flow) {
    return {
        id: flow.id,
        trigger: normalizeTrigger(flow.trigger),
        steps: normalizeSteps(flow.steps || []),
    };
}

function normalizeTrigger(trigger) {
    if (!trigger) {
        return null;
    }

    return Object.fromEntries(
        Object.entries(trigger).sort(([left], [right]) => left.localeCompare(right)),
    );
}

function normalizeSteps(steps) {
    return steps.map((step) => {
        const ordered = Object.fromEntries(
            Object.entries(step)
                .filter(([key]) => key !== 'then' && key !== 'else')
                .sort(([left], [right]) => left.localeCompare(right)),
        );

        if (step.then) {
            ordered.then = normalizeSteps(step.then);
        }

        if (step.else) {
            ordered.else = normalizeSteps(step.else);
        }

        return ordered;
    });
}
