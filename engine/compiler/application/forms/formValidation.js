export function compileFormValidation(form) {
    const checks = form.fields
        .filter((field) => field.required)
        .map(
            (field) =>
                `  if (!${form.id}.${field.name}) errors.${field.name} = "Required";`,
        )
        .join('\n');

    return `
const errors = {};
${checks ? `\n${checks}\n` : '\n'}
return errors;
`.trim();
}
