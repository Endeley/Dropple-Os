import { RotateSession } from '@/runtime/interactions/input/sessions/RotateSession.js';

function runSession() {
  const session = new RotateSession({
    nodeIds: ['a'],
    nodes: [{ id: 'a', rotation: 0 }],
    startPointerWorld: { x: 1, y: 0 },
    centerWorld: { x: 0, y: 0 },
  });

  session.onPointerMove({ x: 0, y: 1 });
  const preview = session.getPreview();
  session.onPointerUp({ x: 0, y: 1 });
  const commit = session.commit();

  return { preview, commit };
}

const a = runSession();
const b = runSession();

const previewA = JSON.stringify(a.preview);
const previewB = JSON.stringify(b.preview);
const commitA = JSON.stringify(a.commit);
const commitB = JSON.stringify(b.commit);

if (previewA !== previewB) {
  console.error('Rotate preview non-deterministic');
  process.exit(1);
}

if (commitA !== commitB) {
  console.error('Rotate commit non-deterministic');
  process.exit(1);
}

console.log('ROTATE SESSION PREVIEW DETERMINISTIC: true');
console.log('ROTATE COMMIT DETERMINISTIC: true');
