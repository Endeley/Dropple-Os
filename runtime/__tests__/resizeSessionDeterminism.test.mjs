import { ResizeSession } from '@/runtime/interactions/input/sessions/ResizeSession.js';

const nodes = [
  { id: 'a', x: 0, y: 0, width: 100, height: 50 },
];

function runSession() {
  const session = new ResizeSession({
    nodeIds: ['a'],
    nodes,
    startPointer: { x: 0, y: 0 },
    handle: 'se',
  });

  session.onPointerMove({ x: 10, y: 5 });
  const preview = session.getPreview();
  session.onPointerUp({ x: 10, y: 5 });
  const commit = session.commit();

  return { preview, commit };
}

const a = runSession();
const b = runSession();

const previewA = JSON.stringify(a.preview);
const previewB = JSON.stringify(b.preview);
const commitA = JSON.stringify(a.commit);
const commitB = JSON.stringify(b.commit);

if (previewA !== previewB || commitA !== commitB) {
  console.error('Resize session non-deterministic');
  process.exit(1);
}

console.log('RESIZE SESSION PREVIEW DETERMINISTIC: true');
