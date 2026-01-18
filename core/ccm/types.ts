export type TemplateArtifactV1 = {
    metadata: Metadata;
    structure: Structure;
    motion: Motion;
    params: Params;
    runtime: Runtime;
};

export type Metadata = {
    id: string;
    version: string;
    name: string;
    engine: string;
    author?: string;
    license?: string;
    createdAt?: string;
    description?: string;
    checksum?: string;
};

export type Structure = {
    root: string;
    nodes: StructureNode[];
    tree: Record<string, string[]>;
    layout?: Record<string, string>;
};

export type StructureNode = {
    id: string;
    type: string;
};

export type Motion = {
    timelines: Record<string, MotionTimeline>;
    triggers?: Record<string, string>;
};

export type MotionTimeline = {
    duration: number;
    tracks: MotionTrack[];
};

export type MotionTrack = {
    target: string;
    property: string;
    keyframes: MotionKeyframe[];
};

export type MotionKeyframe = {
    t: number;
    v: number | string;
};

export type Params = {
    content?: Record<string, ParamDefinition>;
    style?: Record<string, ParamDefinition>;
    motion?: Record<string, ParamDefinition>;
};

export type ParamDefinition = {
    type: string;
    default?: unknown;
    values?: unknown[];
    required?: boolean;
};

export type Runtime = {
    viewport?: Array<"mobile" | "desktop">;
    autoplay?: boolean;
    loop?: boolean;
    reducedMotionFallback?: boolean;
    marketplaceSafe?: boolean;
    export?: {
        motionVideo?: boolean;
        code?: boolean;
    };
};
