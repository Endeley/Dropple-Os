export function parseViewerParams() {
  if (typeof window === 'undefined') {
    return { zoom: 1, bg: 'light', timeline: true, controls: true };
  }

  const hash = window.location.hash || '';
  const [, query = ''] = hash.split('?');
  const params = new URLSearchParams(query || window.location.search);

  const zoom = Number(params.get('zoom')) || 1;
  const bg = params.get('bg') || 'light';
  const timeline = params.get('timeline') !== 'off';
  const controls = params.get('controls') !== 'off';

  return { zoom, bg, timeline, controls };
}
