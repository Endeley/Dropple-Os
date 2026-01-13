'use client';

import { Control, Input, Select } from '@/ui/Control';
import { colors, radius, spacing } from '@/ui/tokens';

function ReorderList({ parent, emit }) {
  const children = parent.children;

  function move(from, to) {
    emit({
      type: 'node.children.reorder',
      payload: {
        parentId: parent.id,
        fromIndex: from,
        toIndex: to,
      },
    });
  }

  return (
    <div style={{ marginTop: 12 }}>
      <strong>Order</strong>
      {children.map((id, index) => (
        <div
          key={id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
          }}
        >
          <span style={{ flex: 1 }}>{id}</span>
          <button disabled={index === 0} onClick={() => move(index, index - 1)}>
            ↑
          </button>
          <button
            disabled={index === children.length - 1}
            onClick={() => move(index, index + 1)}
          >
            ↓
          </button>
        </div>
      ))}
    </div>
  );
}

export function AutoLayoutPanel({ node, emit }) {
  const auto = node.layout.autoLayout;

  if (!node.children?.length) return null;

  function enable() {
    emit({
      type: 'node.layout.setAutoLayout',
      payload: { nodeId: node.id, config: {} },
    });
  }

  function disable() {
    emit({
      type: 'node.layout.clearAutoLayout',
      payload: { nodeId: node.id },
    });
  }

  if (!auto) {
    return (
      <button
        onClick={enable}
        style={{
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
        }}
      >
        Enable Auto-Layout
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      <button
        onClick={disable}
        style={{
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
        }}
      >
        Remove Auto-Layout
      </button>

      <Control label="Layout Type">
        <Select
          value={auto.type}
          onChange={(e) =>
            emit({
              type: 'node.layout.setAutoLayout',
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
              onChange={(e) =>
                emit({
                  type: 'node.layout.setAutoLayout',
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
              onChange={(e) =>
                emit({
                  type: 'node.layout.setAutoLayout',
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
              onChange={(e) =>
                emit({
                  type: 'node.layout.setAutoLayout',
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
              onChange={(e) =>
                emit({
                  type: 'node.layout.setAutoLayout',
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
              onChange={(e) =>
                emit({
                  type: 'node.layout.setAutoLayout',
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
              onChange={(e) =>
                emit({
                  type: 'node.layout.setAutoLayout',
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

      <ReorderList parent={node} emit={emit} />
    </div>
  );
}
