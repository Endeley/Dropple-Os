/**
 * SceneGraph v1 Contract
 *
 * Pure schema + types. No runtime. No reducer. No UI.
 */

export type SceneGraphV1 = {
    version: 1;

    /**
     * Active scene pointer.
     * Does NOT imply mutation.
     */
    activeSceneId: string | null;

    /**
     * Active shot pointer.
     * Must belong to activeSceneId.
     */
    activeShotId: string | null;

    /**
     * Ordered scene list.
     * Order matters for render/export.
     */
    scenes: SceneV1[];
};

export type SceneV1 = {
    id: string;
    name: string;

    /**
     * Total scene duration in milliseconds.
     * Must be >= max(shot.start + shot.duration).
     */
    duration: number;

    /**
     * Legacy single-track shot list kept for compatibility.
     * Canonical authoring truth lives in shotTracks.
     */
    shots?: ShotV1[];

    /**
     * Ordered shot track list.
     * Canonical authoring truth.
     */
    shotTracks?: ShotTrackV1[];

    /**
     * Optional scene-level audio
     * (music, narration across shots)
     */
    audioTracks?: AudioTrackV1[];
};

export type ShotV1 = {
    id: string;
    name: string;

    /**
     * Start position inside scene.
     */
    start: number;

    /**
     * Duration of this shot.
     */
    duration: number;

    /**
     * Composition reference.
     * Points to a NodeTree root.
     */
    compositionId: string;

    /**
     * Camera track for cinematic movement.
     */
    camera?: CameraTrackV1;

    /**
     * Optional transition into the next adjacent shot.
     */
    transitionOut?: TransitionV1 | null;

    /**
     * Optional per-shot audio.
     */
    audioTracks?: AudioTrackV1[];
};

export type ShotTrackV1 = {
    id: string;
    name?: string;
    order: number;
    kind?: 'shot';
    shots: ShotV1[];
};

export type TransitionV1 = {
    type: 'cut' | 'crossfade';
    durationMs: number;
};

export type CameraTrackV1 = {
    keyframes: CameraKeyframeV1[];
};

export type CameraKeyframeV1 = {
    /**
     * Time relative to shot start.
     */
    time: number;
    x: number;
    y: number;
    zoom: number;
    rotation?: number;
};

export type AudioTrackV1 = {
    id: string;
    sourceAssetId: string;
    start: number;
    duration: number;
    volume?: number;
};

/**
 * Empty SceneGraph v1 schema.
 * Useful for initialization only. Enforcement happens later.
 */
export const EMPTY_SCENE_GRAPH_V1: SceneGraphV1 = {
    version: 1,
    activeSceneId: null,
    activeShotId: null,
    scenes: [],
};
