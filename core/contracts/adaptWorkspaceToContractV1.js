function toArray(maybeSetOrArray) {
  if (!maybeSetOrArray) return [];
  if (Array.isArray(maybeSetOrArray)) return maybeSetOrArray;
  if (maybeSetOrArray instanceof Set) return Array.from(maybeSetOrArray);
  return [];
}

function inferCanvasKind(ws) {
  if (ws.id === 'animation') return 'animation';
  if (ws.id === 'icons') return 'icon';
  if (ws.id === 'document') return 'document';
  if (ws.id === 'dev') return 'dev';
  if (ws.id === 'ai') return 'ai';
  if (ws.id === 'review') return 'review';
  if (ws.id === 'video') return 'video';
  if (ws.id === 'podcast') return 'podcast';
  if (ws.id === 'material') return 'material';
  return 'design';
}

function inferMutationPolicy(ws) {
  if (ws.capabilities?.editing === false) return 'readonly';
  if (ws.id === 'dev') return 'readonly';
  if (ws.id === 'review' || ws.profile === 'ux-validation') return 'guarded';
  return 'open';
}

export function adaptWorkspaceToContractV1(ws) {
  const name = ws.label ?? ws.name ?? ws.id;
  const kind = inferCanvasKind(ws);

  const caps = [];
  const denies = [];

  // canvas enabled
  const canvasEnabled = ws.capabilities?.canvas !== false;

  // surface + viewport from canvasPolicy/canvasSurface if present
  if (ws.canvasSurface?.type === 'dots') caps.push('surface:dots');
  if (ws.canvasSurface?.type === 'grid') caps.push('surface:grid');
  if (ws.canvasSurface?.type === 'smooth') caps.push('surface:smooth');

  if (ws.canvasPolicy?.allowPan) caps.push('viewport:panzoom');
  if (ws.canvasPolicy?.allowZoom) caps.push('viewport:zoom');
  if (ws.canvasPolicy?.origin === 'center') caps.push('viewport:origin:center');
  if (ws.canvasSurface?.snap) caps.push('snap:enabled');

  // tools -> node type affordances
  if (ws.tools?.includes('select')) caps.push('select:basic');

  if (
    ws.tools?.some((t) =>
      ['move', 'resize', 'text', 'image', 'frame', 'shape', 'path'].includes(t)
    )
  ) {
    caps.push('node:mutate');
  }

  if (ws.tools?.includes('frame')) caps.push('node:type:frame');
  if (ws.tools?.includes('text')) caps.push('node:type:text');
  if (ws.tools?.includes('image')) caps.push('node:type:image');
  if (ws.tools?.includes('shape')) caps.push('node:type:shape');
  if (ws.tools?.includes('path')) caps.push('node:path', 'path:edit');

  // timeline policy
  const timelineEnabled =
    ws.timeline === null || ws.timeline?.enabled === false
      ? false
      : ws.capabilities?.timeline === true || ws.timeline?.readOnly !== undefined;
  const timelineReadOnly =
    ws.timeline?.readOnly === true || ws.timeline?.config?.readOnly === true;

  if (timelineEnabled) {
    caps.push('timeline:view');
    if (timelineReadOnly) {
      denies.push('timeline:edit', 'keyframe:create', 'keyframe:mutate');
    } else {
      caps.push('timeline:edit', 'keyframe:create', 'keyframe:mutate');
    }
  } else {
    denies.push('timeline:edit', 'keyframe:create', 'keyframe:mutate');
  }

  // animation
  if (ws.capabilities?.animation) {
    caps.push('animation:enabled');
  } else {
    denies.push('animation:enabled');
  }

  // nesting / shapes
  if (ws.capabilities?.allowFrameNesting) caps.push('node:nesting:frames');
  else denies.push('node:nesting:frames');

  if (ws.capabilities?.allowRootShapes) caps.push('node:type:shape');
  else denies.push('node:type:shape');

  // triggers
  const triggers = toArray(ws.enabledTriggerTypes);
  if (triggers.includes('manual')) caps.push('trigger:manual');
  if (triggers.includes('click')) caps.push('trigger:click');
  if (triggers.some((t) => t.startsWith('pointer_'))) caps.push('trigger:pointer');

  // export
  const formats = ws.export?.formats ?? [];
  if (formats.length) {
    caps.push('export:open', 'export:run');
    if (formats.includes('react')) caps.push('export:format:react');
    if (formats.includes('html')) caps.push('export:format:html');
    if (formats.includes('css')) caps.push('export:format:css');
  }

  // dev tools
  if (ws.tools?.includes('inspect')) caps.push('dev:inspect');
  if (ws.tools?.includes('translate')) caps.push('dev:translate');
  if (ws.tools?.includes('refactor')) caps.push('dev:refactor');

  // hard blocks when canvas disabled (dev)
  if (!canvasEnabled) {
    denies.push('node:create', 'node:mutate', 'node:delete');
  }

  const renderTargets = [];
  if (formats.includes('svg')) renderTargets.push('vector:svg');
  if (formats.includes('lottie')) renderTargets.push('vector:lottie');
  if (formats.includes('mp4')) renderTargets.push('raster:mp4');
  if (formats.includes('gif')) renderTargets.push('raster:gif');
  if (formats.includes('png')) renderTargets.push('frames:png');
  if (formats.includes('mp3')) renderTargets.push('audio:mp3');
  if (formats.includes('wav')) renderTargets.push('audio:wav');

  const media = {
    audio: Boolean(ws.capabilities?.audio),
    video: Boolean(ws.capabilities?.video),
  };

  if ((media.audio || media.video) && !renderTargets.includes('player:web')) {
    renderTargets.push('player:web');
  }

  const timelineMode = !timelineEnabled
    ? 'none'
    : timelineReadOnly
    ? 'view'
    : 'edit';

  return {
    id: ws.id,
    name,
    version: 1,
    zone: 'ui',
    profile: ws.profile,
    extends: ws.extends,
    status: ws.status,

    canvas: {
      kind,
      enabled: canvasEnabled,
      policy: ws.canvasPolicy,
      surface: ws.canvasSurface,
    },

    ui: {
      tools: ws.tools ?? [],
      panels: ws.panels ?? [],
    },

    policy: {
      mutation: inferMutationPolicy(ws),
      capabilities: caps,
      denies,
    },

    events: {
      allowedEventTypes: toArray(ws.allowedEventTypes),
      enabledTriggerTypes: triggers,
    },

    timeline: {
      enabled: timelineEnabled,
      mode: timelineMode,
      allowedProperties: ws.timeline?.allowedProperties ?? [],
    },

    media,

    render: renderTargets.length ? { targets: renderTargets } : undefined,

    export: ws.export ? { formats } : undefined,

    legacy: ws,
  };
}
