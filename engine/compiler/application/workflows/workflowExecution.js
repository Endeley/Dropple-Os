export function buildWorkflowExecutors(context, options = {}) {
    const workflows = context.application?.workflows || [];

    return workflows
        .map((flow) => buildExecutor(flow, options))
        .join('\n\n');
}

function buildExecutor(flow, options) {
    const name = capitalize(flow.id);
    const steps = buildSteps(flow.steps, options);

    return `
async function run${name}(workflowContext) {
${steps}
}
`.trim();
}

function buildSteps(steps, options) {
    return steps
        .map((step) => buildStep(step, options))
        .filter(Boolean)
        .map((step) => indent(step, 1))
        .join('\n');
}

function buildStep(step, options) {
    if (step.type === 'if') {
        return `
if (${step.condition}) {
${indent(buildSteps(step.then || [], options), 1)}
} else {
${indent(buildSteps(step.else || [], options), 1)}
}`.trim();
    }

    if (step.type === 'navigate') {
        return `${options.navigateAccessor || 'navigate'}(${JSON.stringify(step.to)});`;
    }

    if (step.type === 'notify') {
        return `${options.notifyAccessor || 'console.warn'}(${JSON.stringify(step.message)});`;
    }

    if (step.type === 'fetch') {
        return `await fetch(${JSON.stringify(step.url)});`;
    }

    if (step.type === 'setState' && typeof step.target === 'string') {
        const [slice, key] = step.target.split('.');
        const setter = `${options.stateSetterPrefix || ''}set${capitalize(slice)}`;

        if (!key) {
            return `${setter}(${JSON.stringify(step.value)});`;
        }

        return `${setter}((prev) => ({ ...prev, ${JSON.stringify(key)}: ${JSON.stringify(step.value)} }));`;
    }

    return '';
}

function indent(value, level) {
    const padding = '  '.repeat(level);
    return value
        .split('\n')
        .map((line) => (line ? `${padding}${line}` : line))
        .join('\n');
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
