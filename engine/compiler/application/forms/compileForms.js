export function compileForms(context) {
    const forms = Array.isArray(context.ir?.forms) ? context.ir.forms : [];

    const normalized = forms
        .slice()
        .sort((left, right) => left.id.localeCompare(right.id))
        .map(normalizeForm);

    context.application.forms = normalized;

    return normalized;
}

function normalizeForm(form) {
    return {
        id: form.id,
        fields: normalizeFields(form.fields || []),
        submit: normalizeSubmit(form.submit),
    };
}

function normalizeFields(fields) {
    return fields
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((field) => ({
            name: field.name,
            type: field.type || 'text',
            required: Boolean(field.required),
        }));
}

function normalizeSubmit(submit) {
    if (!submit || typeof submit !== 'object') {
        return null;
    }

    return {
        action: submit.action
            ? Object.fromEntries(
                  Object.entries(submit.action).sort(([left], [right]) =>
                      left.localeCompare(right),
                  ),
              )
            : null,
    };
}
