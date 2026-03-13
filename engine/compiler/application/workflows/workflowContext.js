export function createWorkflowCompilerContext(context) {
    if (!context.application) {
        context.application = {};
    }

    context.application.workflows = [];

    return context;
}
