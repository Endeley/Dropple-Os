import { buildReactFormBindings } from '../../application/forms/formBindings.js';
import { compileFormValidation } from '../../application/forms/formValidation.js';
export function buildReactForms(context) {
    const forms = context.application?.forms || [];

    return forms
        .map((form) => buildReactFormState(form))
        .join('\n  ');
}

export function buildReactFormState(form) {
    return buildReactFormBindings(form);
}

export function buildReactFormProps(context, scope = 'local') {
    const forms = context.application?.forms || [];

    return forms
        .flatMap((form) => [
            `${form.id}={${readScope(scope, form.id)}}`,
            `set${capitalize(form.id)}={${readScope(scope, `set${capitalize(form.id)}`)}}`,
            `handle${capitalize(form.id)}Submit={${readScope(scope, `handle${capitalize(form.id)}Submit`)}}`,
        ])
        .join(' ');
}

export function buildReactFormSubmitHandlers(context, options = {}) {
    const forms = context.application?.forms || [];
    const navigateAccessor = options.navigateAccessor || 'navigate';

    return forms
        .map((form) => {
            const validation = compileFormValidation(form);
            const submitAction = buildSubmitAction(form.submit?.action, navigateAccessor);

            return `
function handle${capitalize(form.id)}Submit(e, ${navigateAccessor}) {
  e.preventDefault();
  const errors = validate${capitalize(form.id)}(${form.id});
  if (Object.keys(errors).length > 0) {
    return errors;
  }
  ${submitAction || 'return {};'}
  return {};
}

function validate${capitalize(form.id)}(${form.id}) {
  ${validation}
}
`.trim();
        })
        .join('\n\n  ');
}

export function buildReactFormNodeProps(node, context, options = {}) {
    const form = resolveFormForNode(node, context);
    if (!form) {
        return '';
    }

    const formAccessor = options.stateAccessor === 'props' ? `props.${form.id}` : form.id;
    const setterAccessor =
        options.stateAccessor === 'props'
            ? `props.set${capitalize(form.id)}`
            : `set${capitalize(form.id)}`;

    const submitAccessor =
        options.submitAccessor || (options.stateAccessor === 'props'
            ? `props.handle${capitalize(form.id)}Submit`
            : `handle${capitalize(form.id)}Submit`);

    const tag = String(node.type || '').toLowerCase();

    if (tag === 'form') {
        return `onSubmit={${submitAccessor}}`;
    }

    const fieldName = resolveFieldName(node);
    if (!fieldName) {
        return '';
    }

    const field = form.fields.find((entry) => entry.name === fieldName);
    const props = [];

    props.push(`value={${formAccessor}.${fieldName}}`);
    props.push(
        `onChange={(e) => ${setterAccessor}((prev) => ({ ...prev, ${JSON.stringify(fieldName)}: e.target.value }))}`,
    );

    if (field?.required) {
        props.push('required');
    }

    if (field?.type && tag === 'input') {
        props.push(`type="${field.type}"`);
    }

    if (node.props?.placeholder) {
        props.push(`placeholder=${JSON.stringify(node.props.placeholder)}`);
    }

    return props.join(' ');
}

export function resolveFormForNode(node, context) {
    const forms = context.application?.forms || [];
    const formId = resolveBoundFormId(node) || node.props?.formId || inferFormId(node, forms);

    return forms.find((form) => form.id === formId) || null;
}

function inferFormId(node, forms) {
    if (String(node.type || '').toLowerCase() === 'form') {
        return node.id;
    }

    const fieldName = resolveFieldName(node);
    if (!fieldName) {
        return null;
    }

    return forms.find((form) => form.fields.some((field) => field.name === fieldName))?.id || null;
}

function resolveFieldName(node) {
    const binding = node.binding;
    if (binding?.type === 'form') {
        return binding.field || parseBindingSource(binding.source).field || null;
    }

    return node.props?.field || node.props?.name || null;
}

function readScope(scope, name) {
    return scope === 'props' ? `props.${name}` : name;
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildSubmitAction(action, navigateAccessor) {
    if (!action || typeof action !== 'object') {
        return null;
    }

    if (action.type === 'navigate') {
        return `${navigateAccessor}(${JSON.stringify(action.to)});`;
    }

    if (action.type === 'setState' && typeof action.target === 'string') {
        const [slice, key] = action.target.split('.');
        const setter = `set${capitalize(slice)}`;

        if (!key) {
            return `${setter}(${JSON.stringify(action.value)});`;
        }

        return `${setter}((prev) => ({ ...prev, ${JSON.stringify(key)}: ${JSON.stringify(action.value)} }));`;
    }

    return null;
}

function resolveBoundFormId(node) {
    const binding = node.binding;
    if (!binding || binding.type !== 'form') {
        return null;
    }

    return binding.form || parseBindingSource(binding.source).form || null;
}

function parseBindingSource(source) {
    if (typeof source !== 'string') {
        return { form: null, field: null };
    }

    const [form, field] = source.split('.');
    return {
        form: form || null,
        field: field || null,
    };
}
