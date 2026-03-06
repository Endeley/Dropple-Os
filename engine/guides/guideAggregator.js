import { roundWorld } from '@/core/math/pixelRounding.js';

function stableNodeId(node) {
  return String(node?.id ?? '');
}

export function guideAggregator({ guides = [] } = {}) {
  const filtered = Array.isArray(guides)
    ? guides.filter(Boolean)
    : [];

  const stable = [...filtered].sort((a, b) => {
    const ta = String(a.type ?? '');
    const tb = String(b.type ?? '');
    if (ta !== tb) return ta.localeCompare(tb);
    const ax = String(a.axis ?? '');
    const bx = String(b.axis ?? '');
    if (ax !== bx) return ax.localeCompare(bx);
    const xa = roundWorld(a.x ?? a.x1 ?? 0);
    const xb = roundWorld(b.x ?? b.x1 ?? 0);
    if (xa !== xb) return xa - xb;
    const ya = roundWorld(a.y ?? a.y1 ?? 0);
    const yb = roundWorld(b.y ?? b.y1 ?? 0);
    if (ya !== yb) return ya - yb;
    const nx = (a.nodes || []).map(stableNodeId).join(',');
    const mx = (b.nodes || []).map(stableNodeId).join(',');
    if (nx !== mx) return nx.localeCompare(mx);
    const da = a.distance ?? a.spacing ?? 0;
    const db = b.distance ?? b.spacing ?? 0;
    if (da !== db) return da - db;
    return 0;
  });

  return stable;
}
