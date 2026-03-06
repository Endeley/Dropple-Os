import { roundWorld } from '../../core/math/pixelRounding.js';

function buildCandidateValues(candidate) {
  const b = candidate.bounds;
  if (!b) return [];
  const left = b.x;
  const right = b.x + b.width;
  const centerX = b.x + b.width / 2;
  const top = b.y;
  const bottom = b.y + b.height;
  const centerY = b.y + b.height / 2;

  return [
    { axis: 'x', value: left },
    { axis: 'x', value: right },
    { axis: 'x', value: centerX },
    { axis: 'y', value: top },
    { axis: 'y', value: bottom },
    { axis: 'y', value: centerY },
  ];
}

export function resolveSnap({
  pointerWorld,
  nodeBounds,
  candidates = [],
  gridSize = null,
  threshold = 6,
}) {
  const guides = [];
  const bestX = { dist: threshold + 1, value: null, guide: null };
  const bestY = { dist: threshold + 1, value: null, guide: null };

  if (gridSize && gridSize > 0) {
    const gx = Math.round(pointerWorld.x / gridSize) * gridSize;
    const gy = Math.round(pointerWorld.y / gridSize) * gridSize;
    const dx = Math.abs(gx - pointerWorld.x);
    const dy = Math.abs(gy - pointerWorld.y);

    if (dx <= threshold && dx < bestX.dist) {
      bestX.dist = dx;
      bestX.value = gx;
      bestX.guide = null;
    }
    if (dy <= threshold && dy < bestY.dist) {
      bestY.dist = dy;
      bestY.value = gy;
      bestY.guide = null;
    }
  }

  const ordered = [...candidates].sort((a, b) =>
    String(a.nodeId).localeCompare(String(b.nodeId))
  );

  ordered.forEach((candidate) => {
    buildCandidateValues(candidate).forEach((entry) => {
      const target = entry.axis === 'x' ? bestX : bestY;
      const pointValue = entry.axis === 'x' ? pointerWorld.x : pointerWorld.y;
      const dist = Math.abs(entry.value - pointValue);
      if (dist <= threshold && dist < target.dist) {
        target.dist = dist;
        target.value = entry.value;
        target.guide = {
          type: entry.axis === 'x' ? 'vertical' : 'horizontal',
          ...(entry.axis === 'x' ? { x: entry.value } : { y: entry.value }),
          sourceNodeId: candidate.nodeId,
        };
      }
    });
  });

  if (bestX.guide) guides.push(bestX.guide);
  if (bestY.guide) guides.push(bestY.guide);

  const snappedPoint = {
    x: roundWorld(bestX.value ?? pointerWorld.x),
    y: roundWorld(bestY.value ?? pointerWorld.y),
  };

  return { snappedPoint, guides };
}
