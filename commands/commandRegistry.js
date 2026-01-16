import { exportJSON } from '@/export/exportJSON';
import { exportSVG } from '@/export/svg/exportSVG';
import { exportPNG } from '@/export/png/exportPNG';
import { createShareLink } from '@/share/createShareLink';
import { createEmbedCodeFromPreset } from '@/share/createEmbedCode';
import { CapabilityActions } from '@/ui/capabilities/capabilityActions';
import { publishCurrentDocument } from '@/gallery/publishToGallery';

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
  events = [],
  cursorIndex = -1,
  selected = [],
  mode,
}) {
  return [
    {
      id: 'export-json',
      title: 'Export JSON',
      category: 'File',
      modes: ['graphic', 'ui', 'animation'],
      keywords: ['export', 'json', 'file'],
      run: () => exportJSON({ nodes, events, cursor: { index: cursorIndex } }),
    },
    {
      id: 'export-svg',
      title: 'Export SVG',
      category: 'Export',
      modes: ['graphic', 'ui', 'animation'],
      keywords: ['export', 'svg', 'vector'],
      run: () => exportSVG({ nodes }),
    },
    {
      id: 'export-png',
      title: 'Export PNG',
      category: 'Export',
      modes: ['graphic', 'animation'],
      keywords: ['export', 'png', 'image'],
      run: () => exportPNG({ nodes, scale: 2 }),
    },
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
      id: 'publish-gallery',
      title: 'Publish to Gallery',
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
  ];
}
