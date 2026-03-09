import { layoutChildren } from './layoutChildren.js';
import { measureLayout } from './measureLayout.js';

export function evaluateLayout({
    sceneGraph,
    layoutNodes = {},
    nodeGeometry = {},
    dirtyNodes = [],
    fullPass = false,
} = {}) {
    const measurement = measureLayout({
        sceneGraph,
        layoutNodes,
        nodeGeometry,
    });
    const laidOut = layoutChildren({
        sceneGraph,
        layoutNodes,
        nodeGeometry,
        measured: measurement.measured,
    });
    const diagnostics = [
        ...(measurement.diagnostics ?? []),
        ...(laidOut.diagnostics ?? []),
    ];
    const affectedNodes = new Set(laidOut.affectedNodes ?? []);

    if (fullPass) {
        Object.keys(laidOut.computed ?? {}).forEach((nodeId) => affectedNodes.add(nodeId));
    } else {
        dirtyNodes.filter(Boolean).forEach((nodeId) => affectedNodes.add(nodeId));
    }

    return {
        computed: laidOut.computed ?? {},
        affectedNodes: Array.from(affectedNodes),
        diagnostics,
    };
}
