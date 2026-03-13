export function createApplicationCompilerContext(context) {
    context.application = {
        interactions: [],
        state: {},
        navigation: {
            routes: [],
            initialRoute: null,
        },
    };

    return context;
}
