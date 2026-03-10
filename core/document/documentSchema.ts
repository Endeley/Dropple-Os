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
    version: 1;
    nodes: Record<NodeId, LayoutNode>;
    computed: Record<NodeId, ComputedLayout>;
    dirty: LayoutDirtyState;
    metadata: LayoutMetadata;
};

export type LayoutNode = {
    mode: 'free' | 'flow' | 'grid' | 'constraint';
    container: LayoutContainerConfig | null;
    sizing: LayoutSizing;
    alignSelf: LayoutSelfAlignment;
    constraints: LayoutConstraints;
    offsetLeft?: number;
    offsetRight?: number;
    offsetTop?: number;
    offsetBottom?: number;
    participation: LayoutParticipation;
};

export type LayoutContainerConfig = {
    type: 'row' | 'column' | 'grid';
    wrap: boolean;
    gap: LayoutGap;
    padding: LayoutPadding;
    align: LayoutAlignment;
    columns?: number;
    rows?: number | 'auto';
    columnGap?: number;
    rowGap?: number;
};

export type LayoutGap = {
    main: number;
    cross: number;
};

export type LayoutPadding = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

export type LayoutAlignment = {
    main: 'start' | 'center' | 'end' | 'space-between';
    cross: 'start' | 'center' | 'end' | 'stretch';
};

export type LayoutSizing = {
    width: LayoutAxisSizing;
    height: LayoutAxisSizing;
    minWidth: number | null;
    maxWidth: number | null;
    minHeight: number | null;
    maxHeight: number | null;
    aspectRatio: number | null;
};

export type LayoutAxisSizing = {
    mode: 'fixed' | 'hug' | 'fill' | 'percent';
    value: number | null;
};

export type LayoutSelfAlignment = {
    main: 'auto' | 'start' | 'center' | 'end' | 'stretch';
    cross: 'auto' | 'start' | 'center' | 'end' | 'stretch';
};

export type ComputedLayout = {
    x: number;
    y: number;
    width: number;
    height: number;
    contentBox: LayoutBox;
    paddingBox: LayoutBox;
    revision: number;
};

export type LayoutDirtyState = {
    nodeIds: NodeId[];
    fullPass: boolean;
    revision: number;
};

export type LayoutMetadata = {
    schemaVersion: 1;
};

export type LayoutBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type LayoutConstraints = {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
    centerX: boolean;
    centerY: boolean;
};

export type LayoutParticipation = {
    absoluteInContainer: boolean;
    excluded: boolean;
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

export type MotionKeyframe = {
    id?: string;
    t: number;
    v: number | string | Record<string, unknown>;
    easing?: string;
};

export type MotionClip = {
    id: string;
    target: string;
    property: string;
    keyframes: MotionKeyframe[];
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
