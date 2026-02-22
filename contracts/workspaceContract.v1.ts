export type ZoneId = 'domain' | 'engine' | 'ui' | 'product';

export type CanvasKind =
  | 'design'
  | 'animation'
  | 'icon'
  | 'document'
  | 'video'
  | 'podcast'
  | 'material'
  | 'dev'
  | 'ai'
  | 'review';

export type MutationPolicy = 'open' | 'guarded' | 'readonly';

export type CapabilityFlag =
  // canvas/navigation
  | 'select:basic'
  | 'viewport:panzoom'
  | 'viewport:zoom'
  | 'viewport:origin:center'
  | 'snap:enabled'
  | 'surface:dots'
  | 'surface:grid'
  | 'surface:smooth'

  // node graph
  | 'node:create'
  | 'node:mutate'
  | 'node:delete'
  | 'node:reorder'
  | 'node:type:frame'
  | 'node:type:text'
  | 'node:type:image'
  | 'node:type:shape'
  | 'node:nesting:frames'

  // layout/constraints
  | 'layout:constraints'
  | 'layout:auto'

  // timeline/animation
  | 'timeline:view'
  | 'timeline:edit'
  | 'keyframe:create'
  | 'keyframe:mutate'
  | 'animation:enabled'

  // export
  | 'export:open'
  | 'export:run'
  | 'export:format:react'
  | 'export:format:html'
  | 'export:format:css'

  // triggers/events
  | 'trigger:pointer'
  | 'trigger:click'
  | 'trigger:manual';

export type WorkspaceContractV1 = {
  id: string;
  name: string;
  version: 1;

  zone: ZoneId;

  /** your semantic workspace identity */
  profile?: string;

  /** optional inheritance (you already have extends) */
  extends?: string;

  /** used by UI to show/hide or warn */
  status?: 'active' | 'beta' | 'disabled';

  canvas: {
    kind: CanvasKind;

    enabled: boolean;

    policy?: {
      type?: 'infinite' | 'page';
      origin?: 'center' | 'topleft';
      allowPan?: boolean;
      allowZoom?: boolean;
      showPageBounds?: boolean;
      snapToBounds?: boolean;
    };

    surface?: {
      type?: 'dots' | 'grid' | 'smooth';
      gridSize?: number;
      snap?: boolean;
    };

    enabled?: boolean;
  };

  ui: {
    tools: string[];
    panels: string[];
  };

  /** what the workspace is allowed to do */
  policy: {
    mutation: MutationPolicy;
    capabilities: CapabilityFlag[];
    denies?: CapabilityFlag[];
  };

  events?: {
    allowedEventTypes: string[];
    enabledTriggerTypes?: string[];
  };

  render?: {
    targets: Array<
      | 'vector:svg'
      | 'vector:lottie'
      | 'raster:mp4'
      | 'raster:gif'
      | 'audio:mp3'
      | 'audio:wav'
      | 'frames:png'
      | 'player:web'
    >;
  };

  media?: {
    audio?: boolean;
    video?: boolean;
  };

  timeline?: {
    enabled: boolean;
    mode: 'none' | 'view' | 'edit';
    allowedProperties?: string[];
  };

  export?: {
    formats: string[];
  };

  /** optional gates for certain operations */
  gates?: {
    exportGate?: boolean;
    validationGate?: boolean;
  };

  /** legacy passthrough — we keep your existing object whole */
  legacy?: Record<string, any>;
};
