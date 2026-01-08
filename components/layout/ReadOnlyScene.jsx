'use client';

const mockNodes = [
  {
    id: 'frame-1',
    x: 0,
    y: 0,
    width: 400,
    height: 300,
  },
  {
    id: 'frame-2',
    x: 500,
    y: 200,
    width: 300,
    height: 200,
  },
];

export default function ReadOnlyScene() {
  return (
    <>
      {mockNodes.map((node) => (
        <div
          key={node.id}
          style={{
            position: 'absolute',
            left: node.x,
            top: node.y,
            width: node.width,
            height: node.height,
            border: '1px solid #3b82f6',
            background: 'rgba(59,130,246,0.05)',
          }}
        >
          {node.id}
        </div>
      ))}
    </>
  );
}
