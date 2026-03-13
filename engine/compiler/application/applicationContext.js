export function createApplicationCompilerContext(context) {
    context.application = {
        interactions: [],
        state: {},
        forms: [],
        dataSources: [],
        navigation: {
            routes: [],
            initialRoute: null,
        },
    };

    return context;
}
