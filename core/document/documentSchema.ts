/**
 * Canonical Dropple document schema.
 *
 * Pure schema + types. No runtime. No reducer. No UI.
 */

export type NodeId = string;
export type SceneId = string;
export type ClipId = string;
export type AssetId = string;

export type DroppleDocument = {
    meta: DocumentMeta;
    sceneGraph: SceneGraph;
    layout: LayoutSystem;
    components: ComponentSystem;
    motion: MotionSystem;
    scenes: SceneSystem;
    assets: AssetSystem;
    exports: ExportSettings;
};

export type DocumentMeta = {
    id: string;
    name: string;
    version: number;
    createdAt: number;
    updatedAt: number;
    workspaceMode?: string;
};

/**
 * Phase 1 introduces the canonical document envelope first,
 * then expands subsystem contracts incrementally.
 */
export type SceneGraph = {
    rootIds: NodeId[];
    nodes: Record<NodeId, SceneNode>;
};

export type SceneNode = {
    id: NodeId;
    type: string;
    parentId?: NodeId;
    children: NodeId[];
    props: NodeProps;
    layout?: LayoutBinding;
    motion?: MotionBinding;
    component?: ComponentBinding;
};

export type NodeProps = {
    transform: Transform;
    opacity?: number;
    fill?: string;
    stroke?: string;
};

export type Transform = {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    width?: number;
    height?: number;
};

export type LayoutBinding = Record<string, unknown>;
export type MotionBinding = Record<string, unknown>;
export type ComponentBinding = Record<string, unknown>;

export type LayoutSystem = {
    containers: Record<NodeId, LayoutContainer>;
    constraints: Record<NodeId, LayoutConstraints>;
};

export type LayoutContainer = {
    mode: 'absolute' | 'stack' | 'flex' | 'grid';
    gap?: number;
};

export type LayoutConstraints = {
    left?: boolean;
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
};

export type ComponentSystem = {
    definitions: Record<string, ComponentDefinition>;
    instances: Record<string, ComponentInstance>;
};

export type ComponentDefinition = Record<string, unknown>;
export type ComponentInstance = Record<string, unknown>;

export type MotionSystem = {
    clips: Record<string, MotionClip>;
};

export type MotionClip = {
    id: string;
    duration: number;
    tracks: MotionTrack[];
};

export type MotionTrack = {
    nodeId: string;
    channel: string;
    keyframes: Keyframe[];
};

export type Keyframe = {
    time: number;
    value: number | string;
    easing?: string;
};

export type SceneSystem = {
    scenes: Record<SceneId, SceneDefinition>;
    activeSceneId?: SceneId;
};

export type SceneDefinition = Record<string, unknown>;

export type AssetSystem = {
    images: Record<AssetId, ImageAsset>;
    videos: Record<AssetId, VideoAsset>;
    audio: Record<AssetId, AudioAsset>;
};

export type ImageAsset = {
    id: AssetId;
    url: string;
};

export type VideoAsset = {
    id: AssetId;
    url: string;
};

export type AudioAsset = {
    id: AssetId;
    url: string;
};

export type ExportSettings = {
    targets: ExportTarget[];
};

export type ExportTarget = {
    type: string;
    options?: Record<string, any>;
};
