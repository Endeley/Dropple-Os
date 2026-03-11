import { propagateDirtyNodes } from './propagateDirtyNodes.js';

export function collectDirtyNodes(graph, dirtySet) {
    return propagateDirtyNodes(dirtySet, graph);
}
