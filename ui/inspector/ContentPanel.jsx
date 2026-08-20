'use client';

import { NodeMutationTypes } from '@/core/events/nodeMutationTypes.js';
import { Control, Input, Select } from '@/ui/Control';

function TextArea(props) {
  return (
    <textarea
      {...props}
      style={{
        minHeight: 72,
        padding: 'var(--space-sm)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 13,
        resize: 'vertical',
        color: 'var(--text-primary)',
        background: 'var(--surface-1)',
      }}
    />
  );
}

export function ContentPanel({ node, emit, readOnly = false }) {
  if (!node) return null;

  const contentProps = node.props?.content || {};
  const isText = node.type === 'text' || typeof node.content === 'string';
  const isImage = node.type === 'image';
  const isButton = node.type === 'button';

  function updateText(value) {
    if (readOnly) return;
    emit({
      type: NodeMutationTypes.CONTENT_UPDATE,
      payload: { nodeId: node.id, content: value },
    });
  }

  function updateContentProps(patch) {
    if (readOnly) return;
    emit({
      type: NodeMutationTypes.PROPS_UPDATE,
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
    <div className="inspector-group" style={{ gap: 'var(--space-md)' }}>
      {isText && (
        <>
          <Control label="Text">
            <TextArea
              value={node.content ?? ''}
              onChange={(e) => updateText(e.target.value)}
              placeholder="Enter text"
              disabled={readOnly}
            />
          </Control>
          <Control label="Alignment">
            <Select
              value={contentProps.align || 'left'}
              onChange={(e) => updateContentProps({ align: e.target.value })}
              disabled={readOnly}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
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
              disabled={readOnly}
            />
          </Control>
          <Control label="Alt Text">
            <Input
              value={contentProps.alt || ''}
              onChange={(e) => updateContentProps({ alt: e.target.value })}
              placeholder="Describe the image"
              disabled={readOnly}
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
              disabled={readOnly}
            />
          </Control>
          <Control label="Variant">
            <Select
              value={contentProps.variant || 'primary'}
              onChange={(e) => updateContentProps({ variant: e.target.value })}
              disabled={readOnly}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </Select>
          </Control>
        </>
      )}

      {!isText && !isImage && !isButton && (
        <div className="inspector-subtle" style={{ fontSize: 12 }}>
          No editable content for this node type.
        </div>
      )}
    </div>
  );
}
