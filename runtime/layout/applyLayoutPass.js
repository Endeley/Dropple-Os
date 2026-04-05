import { evaluateLayout } from '@/engine/layout/evaluateLayout.js';
import { evaluateLayoutIncremental } from './evaluateLayoutIncremental.js';
import { compileLayoutSystems } from '../compiler/layout/compileLayoutSystems.js';
import { responsiveLayoutRuntime } from './responsiveLayoutRuntime.js';
import {
    getDocument,
    getLayout,
    getNodes,
    getRootIds,
    resolveLayoutNode,
} from '../document/documentAdapter.js';

function toNumber(value) {
    if (Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return null;
}

function resolveSizeInstruction(value, availableSpace) {
    if (Number.isFinite(value)) {
        return { mode: 'fixed', value };
    }

    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    if (trimmed.endsWith('%')) {
        const percent = Number(trimmed.slice(0, -1));
        if (Number.isFinite(percent) && Number.isFinite(availableSpace)) {
            return {
                mode: 'fixed',
                value: (availableSpace * percent) / 100,
            };
        }
    }

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
        return { mode: 'fixed', value: parsed };
    }

    return null;
}

function compileSizingAxis(value, min, max) {
    if (Number.isFinite(value)) {
        return {
            mode: 'fixed',
            value,
            min,
            max,
        };
    }

    return {
        mode: 'fixed',
        value: null,
        min,
        max,
    };
}

function compileSceneGraphLayoutNode(node = {}, sceneGraph = {}, nodeGeometry = {}) {
    const layout = node?.layout ?? {};
    const mode = layout.mode ?? null;
    const size = layout.size ?? {};
    const flow = layout.flow ?? {};
    const grid = layout.grid ?? {};

    const compiled = {
        mode:
            mode === 'grid'
                ? 'grid'
                : mode === 'stack'
                  ? 'flow'
                  : layout.constraints
                    ? 'constraint'
                    : 'free',
        container: null,
        sizing: {
            width: compileSizingAxis(
                toNumber(size.width),
                toNumber(size.minWidth),
                toNumber(size.maxWidth),
            ),
            height: compileSizingAxis(
                toNumber(size.height),
                toNumber(size.minHeight),
                toNumber(size.maxHeight),
            ),
            minWidth: toNumber(size.minWidth),
            maxWidth: toNumber(size.maxWidth),
            minHeight: toNumber(size.minHeight),
            maxHeight: toNumber(size.maxHeight),
            aspectRatio: null,
        },
        alignSelf: {
            main: 'auto',
            cross: 'auto',
        },
        constraints: {
            left: false,
            right: false,
            top: false,
            bottom: false,
            centerX: false,
            centerY: false,
            ...(layout.constraints ?? {}),
        },
        participation: {
            absoluteInContainer: false,
            excluded: false,
        },
    };

    if (compiled.mode === 'flow') {
        compiled.container = {
            type: flow.direction === 'row' ? 'row' : 'column',
            wrap: flow.wrap === true,
            gap: {
                main: toNumber(flow.gap) ?? 0,
                cross: 0,
            },
            padding: {
                top: toNumber(flow.paddingTop) ?? 0,
                right: toNumber(flow.paddingRight) ?? 0,
                bottom: toNumber(flow.paddingBottom) ?? 0,
                left: toNumber(flow.paddingLeft) ?? 0,
            },
            align: {
                main: flow.justify ?? 'start',
                cross: flow.align ?? 'start',
            },
        };
    } else if (compiled.mode === 'grid') {
        compiled.container = {
            type: 'grid',
            wrap: false,
            gap: {
                main: toNumber(grid.columnGap) ?? 0,
                cross: toNumber(grid.rowGap) ?? 0,
            },
            padding: {
                top: toNumber(grid.paddingTop) ?? 0,
                right: toNumber(grid.paddingRight) ?? 0,
                bottom: toNumber(grid.paddingBottom) ?? 0,
                left: toNumber(grid.paddingLeft) ?? 0,
            },
            align: {
                main: grid.justify ?? 'start',
                cross: grid.align ?? 'start',
            },
            columns: Math.max(1, toNumber(grid.columns) ?? 1),
            rows: grid.rows ?? 'auto',
            columnGap: toNumber(grid.columnGap) ?? 0,
            rowGap: toNumber(grid.rowGap) ?? 0,
        };
    }

    return compiled;
}

function mergeLayoutNode(base, override) {
    return {
        ...base,
        ...override,
        sizing: {
            ...(base?.sizing ?? {}),
            ...(override?.sizing ?? {}),
            width: {
                ...(base?.sizing?.width ?? {}),
                ...(override?.sizing?.width ?? {}),
            },
            height: {
                ...(base?.sizing?.height ?? {}),
                ...(override?.sizing?.height ?? {}),
            },
        },
        alignSelf: {
            ...(base?.alignSelf ?? {}),
            ...(override?.alignSelf ?? {}),
        },
        constraints: {
            ...(base?.constraints ?? {}),
            ...(override?.constraints ?? {}),
        },
        participation: {
            ...(base?.participation ?? {}),
            ...(override?.participation ?? {}),
        },
        container:
            base?.container || override?.container
                ? {
                      ...(base?.container ?? {}),
                      ...(override?.container ?? {}),
                      gap: {
                          ...(base?.container?.gap ?? {}),
                          ...(override?.container?.gap ?? {}),
                      },
                      padding: {
                          ...(base?.container?.padding ?? {}),
                          ...(override?.container?.padding ?? {}),
                      },
                      align: {
                          ...(base?.container?.align ?? {}),
                          ...(override?.container?.align ?? {}),
                      },
                  }
                : null,
    };
}

function buildNodeGeometry(nodes = {}, layoutNodes = {}) {
    return Object.fromEntries(
        Object.entries(nodes).map(([nodeId, node]) => {
            const transform = node?.props?.transform ?? {};
            const layout = layoutNodes?.[nodeId] ?? {};

            const x = layout.x ?? node?.x ?? transform.x ?? 0;
            const y = layout.y ?? node?.y ?? transform.y ?? 0;
            const width = layout.width ?? node?.width ?? transform.width ?? 0;
            const height = layout.height ?? node?.height ?? transform.height ?? 0;

            return [
                nodeId,
                {
                    x,
                    y,
                    width,
                    height,
                },
            ];
        }),
    );
}

function buildLayoutNodes(runtimeState, sceneGraph, nodeGeometry, responsiveOverrides = {}) {
    return Object.fromEntries(
        Object.keys(sceneGraph?.nodes ?? {}).map((nodeId) => [
            nodeId,
            (() => {
                const sceneNode = sceneGraph?.nodes?.[nodeId] ?? {};
                const parentId = sceneNode?.parentId ?? null;
                const parentGeometry = parentId ? nodeGeometry?.[parentId] ?? null : null;
                const canonical = compileSceneGraphLayoutNode(sceneNode, sceneGraph, nodeGeometry);
                const explicit = resolveLayoutNode(runtimeState, nodeId);
                const responsive = responsiveOverrides?.[nodeId] ?? {};
                const merged = mergeLayoutNode(canonical, explicit);

                const widthInstruction = resolveSizeInstruction(
                    responsive.width,
                    parentGeometry?.width,
                );
                const heightInstruction = resolveSizeInstruction(
                    responsive.height,
                    parentGeometry?.height,
                );

                const next = {
                    ...merged,
                    sizing: {
                        ...merged.sizing,
                        width: widthInstruction
                            ? {
                                  ...merged.sizing.width,
                                  ...widthInstruction,
                              }
                            : merged.sizing.width,
                        height: heightInstruction
                            ? {
                                  ...merged.sizing.height,
                                  ...heightInstruction,
                              }
                            : merged.sizing.height,
                    },
                };

                if (responsive.mode === 'grid') {
                    next.mode = 'grid';
                } else if (responsive.mode === 'stack') {
                    next.mode = 'flow';
                } else if (responsive.mode === 'absolute') {
                    next.mode = next.constraints ? 'constraint' : 'free';
                }

                return next;
            })(),
        ]),
    );
}

function applyComputedToNodes(nodes = {}, computed = {}) {
    const nextNodes = {};

    Object.entries(nodes).forEach(([nodeId, node]) => {
        const layoutBox = computed?.[nodeId] ?? null;
        if (!layoutBox) {
            nextNodes[nodeId] = node;
            return;
        }

        nextNodes[nodeId] = {
            ...node,
            x: layoutBox.x,
            y: layoutBox.y,
            width: layoutBox.width,
            height: layoutBox.height,
            layout: {
                ...(node?.layout ?? {}),
                x: layoutBox.x,
                y: layoutBox.y,
                width: layoutBox.width,
                height: layoutBox.height,
            },
        };
    });

    return nextNodes;
}

export function applyLayoutPass(runtimeState) {
    const sceneGraph = getDocument(runtimeState)?.sceneGraph ?? null;
    const layout = getLayout(runtimeState);

    if (!runtimeState || !sceneGraph?.nodes || !layout) {
        return {
            nextState: runtimeState,
            derived: {
                nodes: getNodes(runtimeState),
                rootIds: getRootIds(runtimeState),
            },
        };
    }

    const nodeGeometry = buildNodeGeometry(
        sceneGraph.nodes,
        layout.nodes ?? {},
    );
    const compiledLayout = compileLayoutSystems(runtimeState?.document ?? {});
    const viewportWidth =
        runtimeState?.workspace?.viewport?.width ??
        (compiledLayout.breakpoints?.desktop ?? 1200) + 1;
    const responsiveOverrides = responsiveLayoutRuntime(
        viewportWidth,
        compiledLayout.breakpoints,
        compiledLayout.responsiveRules,
    );
    const layoutNodes = buildLayoutNodes(
        runtimeState,
        sceneGraph,
        nodeGeometry,
        responsiveOverrides,
    );
    const dirty = layout.dirty ?? {
        nodeIds: [],
        fullPass: false,
        revision: 0,
    };

    const result = evaluateLayout({
        sceneGraph,
        layoutNodes,
        nodeGeometry,
        dirtyNodes: dirty.nodeIds ?? [],
        fullPass: dirty.fullPass === true,
    });
    const layoutResult =
        dirty.fullPass === true
            ? result
            : evaluateLayoutIncremental({
                  dirtyNodeIds: dirty.nodeIds ?? [],
                  sceneGraph,
                  layoutNodes,
                  nodeGeometry,
                  previousComputed: layout.computed ?? {},
              });

    const computed = layoutResult.computed ?? {};
    const derivedNodes = applyComputedToNodes(sceneGraph.nodes, computed);
    const nextState = {
        ...runtimeState,
        document: {
            ...runtimeState.document,
            layout: {
                ...layout,
                nodes: layoutNodes,
                computed,
                dirty: {
                    ...dirty,
                    nodeIds: [],
                    fullPass: false,
                },
                metadata: {
                    ...(layout.metadata ?? {}),
                    compiled: compiledLayout,
                    responsiveOverrides,
                },
            },
        },
        nodes: derivedNodes,
        rootIds: sceneGraph.rootIds ?? [],
    };

    return {
        nextState,
        derived: {
            nodes: derivedNodes,
            rootIds: sceneGraph.rootIds ?? [],
        },
        diagnostics: layoutResult.diagnostics ?? [],
        affectedNodes: layoutResult.affectedNodes ?? [],
    };
}
