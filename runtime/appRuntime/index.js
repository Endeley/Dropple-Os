import { resolveNavigation } from './navigation.js';
import { resolveAppState } from './stateMachine.js';

export function evaluateAppRuntime(document, runtime) {
    const app = document?.app ?? {};
    const navigation = resolveNavigation(app, runtime);
    const state = resolveAppState(app);

    return {
        ...runtime,
        app: {
            ...navigation,
            ...state,
        },
    };
}
