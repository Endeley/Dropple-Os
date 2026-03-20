'use client';

export function GraphNodeView({ node, interaction, onCommitNodeDrag }) {
    const isSelected = interaction?.selectedNodeId === node.id;
    const isHovered = interaction?.hoverNodeId === node.id;
    const dragPreview =
        interaction?.draggingNode?.id === node.id
            ? {
                  x: interaction.draggingNode.previewX,
                  y: interaction.draggingNode.previewY,
              }
            : null;
    const x = dragPreview?.x ?? node.position.x;
    const y = dragPreview?.y ?? node.position.y;

    function handleMouseDown(event) {
        event.stopPropagation();
        interaction?.selectNode(node.id);
        interaction?.startNodeDrag(node.id, event.clientX, event.clientY, node.position);
    }

    function handleMouseUp(event) {
        event.stopPropagation();
        onCommitNodeDrag?.();
    }

    return (
        <div
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseEnter={() => interaction?.setHover(node.id)}
            onMouseLeave={() => interaction?.setHover(null)}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                minWidth: 120,
                borderRadius: 12,
                border: isSelected
                    ? '2px solid #60a5fa'
                    : isHovered
                      ? '1px solid rgba(96, 165, 250, 0.72)'
                      : '1px solid rgba(148, 163, 184, 0.28)',
                background: 'rgba(15, 23, 42, 0.92)',
                boxShadow: '0 10px 30px rgba(2, 6, 23, 0.24)',
                color: '#e2e8f0',
                overflow: 'hidden',
                cursor: interaction?.draggingNode?.id === node.id ? 'grabbing' : 'grab',
                transform: isHovered && !isSelected ? 'translateY(-1px)' : 'none',
            }}>
            <div
                style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#93c5fd',
                }}>
                {node.type}
            </div>
            <div
                style={{
                    padding: '10px',
                    fontSize: 12,
                    fontWeight: 600,
                }}>
                {node.id}
            </div>
        </div>
    );
}
