export function renderNodeToSVG(node) {
    const layout = node.layout || {};
    const style = node.style || {};

    const x = layout.x ?? 0;
    const y = layout.y ?? 0;
    const width = layout.width ?? 0;
    const height = layout.height ?? 0;
    const fill = style.fill || 'transparent';
    const opacity = style.opacity ?? 1;

    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" opacity="${opacity}" />`;
}
