import { downloadBlob } from '../utils/download';
import { renderNodeToSVG } from '../svg/renderNodeToSVG';

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

export function exportPNG({ nodes = {}, scale = 1 } = {}) {
    const list = Object.values(nodes);
    if (!list.length) return;

    const bounds = computeBounds(list);
    if (!bounds) return;

    const body = list.map(renderNodeToSVG).join('\n');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">
${body}
</svg>`;

    const img = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = bounds.width * scale;
    canvas.height = bounds.height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((png) => {
            if (!png) return;
            downloadBlob(png, 'dropple-export.png');
        });
    };

    img.onerror = () => {
        URL.revokeObjectURL(url);
    };

    img.src = url;
}
