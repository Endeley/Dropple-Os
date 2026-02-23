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
     * SceneGraph narrative layer.
     */
    sceneGraph: SceneGraphV1;
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
