export function createDataCompilerContext(context) {
    if (!context.application) {
        context.application = {};
    }

    context.application.dataSources = [];

    return context;
}
