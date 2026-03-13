export function buildWorkflowBindings(context, options = {}) {
    const workflows = context.application?.workflows || [];
    const scope = options.scope || 'props';

    return workflows
        .map((flow) => buildBinding(flow, scope))
        .filter(Boolean)
        .join('\n  ');
}

export function findWorkflowByForm(context, formId) {
    return (context.application?.workflows || []).find(
        (flow) => flow.trigger?.type === 'formSubmit' && flow.trigger?.formId === formId,
    ) || null;
}

function buildBinding(flow, scope) {
    if (flow.trigger?.type === 'formSubmit' && flow.trigger?.formId) {
        const workflowName = capitalize(flow.id);
        const formName = capitalize(flow.trigger.formId);
        const runtimeProps = scope === 'props' ? 'props' : 'workflowContext';

        return `async function handle${formName}Workflow(e) {
    e.preventDefault();
    await run${workflowName}({
      ...${runtimeProps},
      navigate,
    });
  }`;
    }

    return '';
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
