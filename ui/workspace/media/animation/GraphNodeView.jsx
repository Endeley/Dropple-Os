'use client';

import { getConnectionValue } from './graphConnectionGuards.js';
import { getVisibleInputs } from './graphNodePorts.js';

export function GraphNodeView({ node, interaction, onCommitNodeDrag }) {
    const isSelected = interaction?.selectedNodeId === node.id;
    const isHovered = interaction?.hoverNodeId === node.id;
    const visibleInputs = getVisibleInputs(node);
    const activeConnection = interaction?.connection ?? null;
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

    function handleOutputMouseDown(event) {
        event.stopPropagation();
        interaction?.startConnection?.(
            node.id,
            event.clientX,
            event.clientY,
        );
    }

    function handleInputMouseUp(event, inputName) {
        event.stopPropagation();

        const connection = activeConnection;
        if (!connection) return;

        interaction?.commitConnection?.({
            from: connection.fromNodeId,
            to: node.id,
            input: inputName,
        });
        interaction?.endConnection?.();
    }

    function getInputState(inputName) {
        const currentSource = getConnectionValue(node, inputName);
        const valid =
            activeConnection &&
            interaction?.canConnect?.({
                from: activeConnection.fromNodeId,
                to: node.id,
                input: inputName,
            });

        return {
            currentSource,
            valid: Boolean(valid),
        };
    }

    const nodeHasValidTarget = visibleInputs.some((inputName) =>
        interaction?.canConnect?.({
            from: activeConnection?.fromNodeId,
            to: node.id,
            input: inputName,
        }),
    );

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
                border: activeConnection && nodeHasValidTarget
                    ? '2px solid #22c55e'
                    : isSelected
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
                opacity: activeConnection && !nodeHasValidTarget && activeConnection.fromNodeId !== node.id ? 0.4 : 1,
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
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '0 10px 10px',
                    gap: 12,
                }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                    }}>
                    {visibleInputs.map((inputName) => (
                        (() => {
                            const { currentSource, valid } = getInputState(inputName);

                            return (
                                <button
                                    key={inputName}
                                    type='button'
                                    onMouseUp={(event) => handleInputMouseUp(event, inputName)}
                                    title={inputName}
                                    style={{
                                        width: 14,
                                        height: 14,
                                        padding: 0,
                                        border: valid
                                            ? '2px solid #22c55e'
                                            : currentSource
                                              ? '1px solid #22c55e'
                                              : '1px solid rgba(148, 163, 184, 0.3)',
                                        borderRadius: 999,
                                        background: currentSource
                                            ? '#22c55e'
                                            : valid
                                              ? '#60a5fa'
                                              : 'rgba(148, 163, 184, 0.5)',
                                        cursor: 'pointer',
                                    }}
                                />
                            );
                        })()
                    ))}
                </div>
                <button
                    type='button'
                    onMouseDown={handleOutputMouseDown}
                    title='output'
                    style={{
                        width: 16,
                        height: 16,
                        padding: 0,
                        border: 'none',
                        borderRadius: 999,
                        background: '#60a5fa',
                        cursor: 'crosshair',
                    }}
                />
            </div>
        </div>
    );
}
