export function createFormCompilerContext(context) {
    if (!context.application) {
        context.application = {};
    }

    context.application.forms = [];

    return context;
}
