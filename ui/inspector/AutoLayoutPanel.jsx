'use client';

import { NodeMutationTypes } from '@/core/events/nodeMutationTypes.js';
import { Control, Input, Select } from '@/ui/Control';

function ReorderList({ parent, emit, readOnly = false }) {
  const children = parent.children;

  function move(from, to) {
    if (readOnly) return;
    emit({
      type: NodeMutationTypes.CHILDREN_REORDER,
      payload: {
        parentId: parent.id,
        fromIndex: from,
        toIndex: to,
      },
    });
  }

  return (
    <div className="inspector-group" style={{ marginTop: 'var(--space-md)' }}>
      <strong className="inspector-title">Order</strong>
      {children.map((id, index) => (
        <div key={id} className="inspector-row" style={{ marginTop: 'var(--space-xs)' }}>
          <span style={{ flex: 1 }}>{id}</span>
          <button
            className="inspector-button"
            disabled={readOnly || index === 0}
            onClick={() => move(index, index - 1)}
          >
            ↑
          </button>
          <button
            className="inspector-button"
            disabled={readOnly || index === children.length - 1}
            onClick={() => move(index, index + 1)}
          >
            ↓
          </button>
        </div>
      ))}
    </div>
  );
}

export function AutoLayoutPanel({ node, emit, readOnly = false }) {
  if (!node) return null;
  const auto = node.layout?.autoLayout ?? null;

  if (!node.children?.length) return null;

  function enable() {
    if (readOnly) return;
    emit({
      type: NodeMutationTypes.LAYOUT_SET_AUTO_LAYOUT,
      payload: { nodeId: node.id, config: {} },
    });
  }

  function disable() {
    if (readOnly) return;
    emit({
      type: NodeMutationTypes.LAYOUT_CLEAR_AUTO_LAYOUT,
      payload: { nodeId: node.id },
    });
  }

  if (!auto) {
    return (
      <button
        className="inspector-button"
        onClick={enable}
        disabled={readOnly}
      >
        Enable Auto-Layout
      </button>
    );
  }

  return (
    <div className="inspector-group" style={{ gap: 'var(--space-md)' }}>
      <button
        className="inspector-button"
        onClick={disable}
        disabled={readOnly}
      >
        Remove Auto-Layout
      </button>

      <Control label="Layout Type">
        <Select
          value={auto.type}
          disabled={readOnly}
          onChange={(e) =>
            emit({
              type: NodeMutationTypes.LAYOUT_SET_AUTO_LAYOUT,
              payload: {
                nodeId: node.id,
                config: { type: e.target.value },
              },
            })
          }
        >
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
        </Select>
      </Control>

      {auto.type === 'grid' ? (
        <>
          <Control label="Columns">
            <Input
              type="number"
              min={1}
              value={auto.columns}
              disabled={readOnly}
              onChange={(e) =>
                emit({
                  type: NodeMutationTypes.LAYOUT_SET_AUTO_LAYOUT,
                  payload: {
                    nodeId: node.id,
                    config: { columns: Number(e.target.value) },
                  },
                })
              }
            />
          </Control>

          <Control label="Gap">
            <Input
              type="number"
              value={auto.gap}
              disabled={readOnly}
              onChange={(e) =>
                emit({
                  type: NodeMutationTypes.LAYOUT_SET_AUTO_LAYOUT,
                  payload: {
                    nodeId: node.id,
                    config: { gap: Number(e.target.value) },
                  },
                })
              }
            />
          </Control>

          <Control label="Padding">
            <Input
              type="number"
              value={auto.padding}
              disabled={readOnly}
              onChange={(e) =>
                emit({
                  type: NodeMutationTypes.LAYOUT_SET_AUTO_LAYOUT,
                  payload: {
                    nodeId: node.id,
                    config: { padding: Number(e.target.value) },
                  },
                })
              }
            />
          </Control>
        </>
      ) : (
        <>
          <Control label="Direction">
            <Select
              value={auto.direction}
              disabled={readOnly}
              onChange={(e) =>
                emit({
                  type: NodeMutationTypes.LAYOUT_SET_AUTO_LAYOUT,
                  payload: {
                    nodeId: node.id,
                    config: { direction: e.target.value },
                  },
                })
              }
            >
              <option value="row">Row</option>
              <option value="column">Column</option>
            </Select>
          </Control>

          <Control label="Gap">
            <Input
              type="number"
              value={auto.gap}
              disabled={readOnly}
              onChange={(e) =>
                emit({
                  type: NodeMutationTypes.LAYOUT_SET_AUTO_LAYOUT,
                  payload: {
                    nodeId: node.id,
                    config: { gap: Number(e.target.value) },
                  },
                })
              }
            />
          </Control>

          <Control label="Padding">
            <Input
              type="number"
              value={auto.padding}
              disabled={readOnly}
              onChange={(e) =>
                emit({
                  type: NodeMutationTypes.LAYOUT_SET_AUTO_LAYOUT,
                  payload: {
                    nodeId: node.id,
                    config: { padding: Number(e.target.value) },
                  },
                })
              }
            />
          </Control>
        </>
      )}

      <ReorderList parent={node} emit={emit} readOnly={readOnly} />
    </div>
  );
}
