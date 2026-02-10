'use client';

import { Control, Input, Select } from '@/ui/Control';
import { colors, spacing, radius } from '@/ui/tokens';

function TextArea(props) {
  return (
    <textarea
      {...props}
      style={{
        minHeight: 72,
        padding: `${spacing.sm}px`,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.sm,
        fontSize: 13,
        resize: 'vertical',
      }}
    />
  );
}

export function ContentPanel({ node, emit }) {
  if (!node) return null;

  const contentProps = node.props?.content || {};
  const isText = node.type === 'text' || typeof node.content === 'string';
  const isImage = node.type === 'image';
  const isButton = node.type === 'button';

  function updateText(value) {
    emit({
      type: 'node.content.update',
      payload: { nodeId: node.id, content: value },
    });
  }

  function updateContentProps(patch) {
    emit({
      type: 'node.props.update',
      payload: {
        nodeId: node.id,
        props: {
          content: {
            ...contentProps,
            ...patch,
          },
        },
      },
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      {isText && (
        <>
          <Control label="Text">
            <TextArea
              value={node.content ?? ''}
              onChange={(e) => updateText(e.target.value)}
              placeholder="Enter text"
            />
          </Control>
          <Control label="Alignment">
            <Select
              value={contentProps.align || 'left'}
              onChange={(e) => updateContentProps({ align: e.target.value })}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </Select>
          </Control>
        </>
      )}

      {isImage && (
        <>
          <Control label="Image Source">
            <Input
              value={contentProps.src || ''}
              onChange={(e) => updateContentProps({ src: e.target.value })}
              placeholder="https://..."
            />
          </Control>
          <Control label="Alt Text">
            <Input
              value={contentProps.alt || ''}
              onChange={(e) => updateContentProps({ alt: e.target.value })}
              placeholder="Describe the image"
            />
          </Control>
        </>
      )}

      {isButton && (
        <>
          <Control label="Label">
            <Input
              value={contentProps.label || ''}
              onChange={(e) => updateContentProps({ label: e.target.value })}
              placeholder="Button label"
            />
          </Control>
          <Control label="Variant">
            <Select
              value={contentProps.variant || 'primary'}
              onChange={(e) => updateContentProps({ variant: e.target.value })}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </Select>
          </Control>
        </>
      )}

      {!isText && !isImage && !isButton && (
        <div style={{ fontSize: 12, color: colors.textMuted }}>
          No editable content for this node type.
        </div>
      )}
    </div>
  );
}
