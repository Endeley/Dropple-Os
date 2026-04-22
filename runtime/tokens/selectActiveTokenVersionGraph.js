import { projectTokenVersionGraph } from './projectTokenVersionGraph.js';

export function selectActiveTokenVersionGraph(state) {
    const tokenVersionGraph = state?.document?.tokenVersions ?? {
        entries: {},
        order: [],
        activeVersionId: null,
    };

    return projectTokenVersionGraph(tokenVersionGraph);
}
