import type { SceneGraphV1 } from './sceneGraph.v1';

/**
 * Project v2 Contract
 *
 * Pure schema + types. No runtime. No reducer. No UI.
 */
export type ProjectV2 = {
    version: 2;

    id: string;
    name: string;

    /**
     * Existing NodeTree / composition state.
     */
    compositions: Record<string, Composition>;

    /**
     * Existing asset registry.
     */
    assets: Record<string, Asset>;

    /**
     * Canonical media sequencing truth.
     */
    sequences?: Record<string, Sequence>;

    /**
     * Export presets and output targets.
     */
    exports?: Record<string, unknown>;

    /**
     * SceneGraph narrative layer.
     */
    sceneGraph: SceneGraphV1;

    /**
     * Optional project-universe artifact graph.
     * Pure authored data; no runtime/session/viewport ownership.
     */
    universe?: ProjectUniverseV1;
};

/**
 * Composition is the canonical NodeTree root container.
 * The concrete shape is defined elsewhere (C1).
 */
export type Composition = Record<string, unknown>;

/**
 * Asset registry entry. Concrete shape defined elsewhere (C1).
 */
export type Asset = Record<string, unknown>;
export type Sequence = Record<string, unknown>;

export type ProjectUniverseArtifactNode = {
    id: string;
    kind: string;
    label?: string;
    x?: number;
    y?: number;
    refs?: string[];
    metadata?: Record<string, unknown>;
};

export type ProjectUniverseV1 = {
    version: 1;
    hubId: string | null;
    nodes: Record<string, ProjectUniverseArtifactNode>;
};
