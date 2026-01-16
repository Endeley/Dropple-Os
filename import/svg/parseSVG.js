export function parseSVG(svgText) {
  if (!svgText) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const rects = Array.from(doc.querySelectorAll('rect'));

  return rects.map((el) => {
    const x = Number(el.getAttribute('x') || 0);
    const y = Number(el.getAttribute('y') || 0);
    const width = Number(el.getAttribute('width') || 0);
    const height = Number(el.getAttribute('height') || 0);
    const fill = el.getAttribute('fill') || 'transparent';
    const opacity = Number(el.getAttribute('opacity') ?? 1);

    return {
      type: 'shape',
      layout: { x, y, width, height },
      style: { fill, opacity },
      props: {},
      content: null,
    };
  });
}
