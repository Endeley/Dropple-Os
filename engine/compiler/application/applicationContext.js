export function createApplicationCompilerContext(context) {
    context.application = {
        interactions: [],
        state: {},
        forms: [],
        dataSources: [],
        workflows: [],
        navigation: {
            routes: [],
            initialRoute: null,
        },
    };

    return context;
}
