import { renderNodeToSVG } from '@/export/svg/renderNodeToSVG';

function computeBounds(nodes) {
  if (!nodes.length) return null;

  const xs = nodes.map((n) => n.layout?.x ?? 0);
  const ys = nodes.map((n) => n.layout?.y ?? 0);
  const xe = nodes.map((n) => (n.layout?.x ?? 0) + (n.layout?.width ?? 0));
  const ye = nodes.map((n) => (n.layout?.y ?? 0) + (n.layout?.height ?? 0));

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xe);
  const maxY = Math.max(...ye);

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export async function generateThumbnail({
  nodes = {},
  width = 320,
  height = 180,
  background = '#f8fafc',
} = {}) {
  const list = Object.values(nodes);
  if (!list.length) return null;

  const bounds = computeBounds(list);
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null;

  const scale = Math.min(width / bounds.width, height / bounds.height);

  const body = list.map(renderNodeToSVG).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">
  <rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="${background}" />
  ${body}
</svg>`;

  const img = new Image();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(scale, scale);

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = url;
  });

  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);

  return canvas.toDataURL('image/png');
}
