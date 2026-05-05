import { createShareLink } from '@/share/createShareLink';
import { createEmbedCodeFromPreset } from '@/share/createEmbedCode';
import { CapabilityActions } from '@/ui/capabilities/capabilityActions';
import { publishCurrentDocument } from '@/gallery/publishToGallery';
import { runCommandIntent } from '@/ui/bridges/runtimeCommandFacade.js';
import {
  ArtifactExportKinds,
  exportArtifact as exportArtifactFacade,
} from '@/runtime/export/exportArtifact.js';
import { getExportCapabilities } from '@/runtime/export/getExportCapabilities.js';

const COMMAND_EXPORT_ACTIONS = Object.freeze({
  json: {
    id: 'export-json',
    title: 'Export JSON',
    category: 'File',
    keywords: ['export', 'json', 'file'],
    modes: ['graphic', 'ui', 'animation'],
    format: ArtifactExportKinds.JSON,
  },
  svg: {
    id: 'export-svg',
    title: 'Export SVG',
    category: 'Export',
    keywords: ['export', 'svg', 'vector'],
    modes: ['graphic', 'ui', 'animation'],
    format: ArtifactExportKinds.SVG,
  },
  png: {
    id: 'export-png',
    title: 'Export PNG',
    category: 'Export',
    keywords: ['export', 'png', 'image'],
    modes: ['graphic', 'animation'],
    format: ArtifactExportKinds.PNG,
    options: Object.freeze({ scale: 2 }),
  },
});

async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.warn('[CommandPalette] clipboard write failed', err);
    }
  }
  window.prompt('Copy link', text);
}

export function buildCommands({
  emit,
  nodes = {},
  selectedIds = [],
  events = [],
  cursorIndex = -1,
  selected = [],
  mode,
  workspaceId = 'graphic',
  publishToServer,
  exportArtifact = null,
}) {
  const exportCapabilities = exportArtifact ? getExportCapabilities(exportArtifact) : null;
  const exportCommands = exportCapabilities
    ? exportCapabilities.formats
        .filter((format) => COMMAND_EXPORT_ACTIONS[format])
        .map((format) => {
          const action = COMMAND_EXPORT_ACTIONS[format];
          return {
            id: action.id,
            title: action.title,
            category: action.category,
            modes: action.modes,
            keywords: action.keywords,
            run: () => exportArtifactFacade({
              artifact: exportArtifact,
              format: action.format,
              options: action.options,
            }),
          };
        })
    : [];

  return [
    {
      id: 'groupSelection',
      title: 'Group',
      category: 'Edit',
      modes: ['graphic', 'ui', 'animation'],
      keywords: ['group', 'wrap', 'selection'],
      requiresSelection: 'multi',
      run: () => {
        return runCommandIntent('group');
      },
    },
    {
      id: 'unwrapSelection',
      title: 'Ungroup',
      category: 'Edit',
      modes: ['graphic', 'ui', 'animation'],
      keywords: ['ungroup', 'unwrap', 'selection'],
      requiresSelection: true,
      run: () => {
        return runCommandIntent('ungroup');
      },
    },
    ...exportCommands,
    {
      id: 'share-link',
      title: 'Create shareable link',
      category: 'Share',
      modes: ['graphic', 'ui', 'animation'],
      keywords: ['share', 'link', 'url'],
      run: async () => {
        const url = createShareLink({ events, cursorIndex });
        await copyToClipboard(url);
      },
    },
    {
      id: 'embed-presentation',
      title: 'Copy embed (Presentation)',
      category: 'Share',
      modes: ['graphic', 'ui', 'animation'],
      keywords: ['embed', 'presentation'],
      run: async () => {
        const code = createEmbedCodeFromPreset('presentation');
        await copyToClipboard(code);
      },
    },
    {
      id: 'embed-docs',
      title: 'Copy embed (Docs)',
      category: 'Share',
      modes: ['graphic', 'ui', 'animation'],
      keywords: ['embed', 'docs', 'documentation'],
      run: async () => {
        const code = createEmbedCodeFromPreset('docs');
        await copyToClipboard(code);
      },
    },
    {
      id: 'embed-minimal',
      title: 'Copy embed (Minimal)',
      category: 'Share',
      modes: ['graphic', 'ui', 'animation'],
      keywords: ['embed', 'minimal', 'clean'],
      run: async () => {
        const code = createEmbedCodeFromPreset('minimal');
        await copyToClipboard(code);
      },
    },
    {
      id: 'publish-gallery-local',
      title: 'Publish to Local Gallery',
      category: 'Share',
      modes: ['graphic', 'ui', 'animation'],
      keywords: ['publish', 'gallery'],
      run: async () => {
        const title = window.prompt('Gallery title');
        if (!title) return;
        const description = window.prompt('Description (optional)') || '';
        const rawTags = window.prompt('Tags (comma separated)') || '';
        const tags = rawTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

        await publishCurrentDocument({
          title,
          description,
          events,
          cursorIndex,
          nodes,
          tags,
          mode,
        });
      },
    },
    publishToServer && {
      id: 'publish-gallery-server',
      title: 'Publish to Public Gallery',
      category: 'Share',
      modes: ['graphic', 'ui', 'animation'],
      keywords: ['publish', 'gallery', 'public'],
      requiresAuth: true,
      run: async () => {
        const title = window.prompt('Public gallery title');
        if (!title) return;
        const description = window.prompt('Description (optional)') || '';
        const rawTags = window.prompt('Tags (comma separated)') || '';
        const tags = rawTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

        await publishToServer({
          title,
          description,
          nodes,
          events,
          cursorIndex,
          tags,
          mode,
        });
      },
    },
    {
      id: 'align-left',
      title: 'Align Left',
      category: 'Align',
      modes: ['graphic', 'ui'],
      keywords: ['align', 'left'],
      requiresSelection: 'multi',
      run: () => CapabilityActions.alignLeft(selected, emit),
    },
    {
      id: 'align-center-x',
      title: 'Align Center (Horizontal)',
      category: 'Align',
      modes: ['graphic', 'ui'],
      keywords: ['align', 'center', 'horizontal'],
      requiresSelection: 'multi',
      run: () => CapabilityActions.alignCenterX(selected, emit),
    },
    {
      id: 'align-right',
      title: 'Align Right',
      category: 'Align',
      modes: ['graphic', 'ui'],
      keywords: ['align', 'right'],
      requiresSelection: 'multi',
      run: () => CapabilityActions.alignRight(selected, emit),
    },
    {
      id: 'distribute-x',
      title: 'Distribute Horizontally',
      category: 'Align',
      modes: ['graphic', 'ui'],
      keywords: ['distribute', 'horizontal'],
      requiresSelection: 'multi',
      run: () => CapabilityActions.distributeX(selected, emit),
    },
    {
      id: 'distribute-y',
      title: 'Distribute Vertically',
      category: 'Align',
      modes: ['graphic', 'ui'],
      keywords: ['distribute', 'vertical'],
      requiresSelection: 'multi',
      run: () => CapabilityActions.distributeY(selected, emit),
    },
  ].filter(Boolean);
}
