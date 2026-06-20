'use client';

import { NodeMutationTypes } from '@/core/events/nodeMutationTypes.js';
import { Control, Input, Select } from '@/ui/Control';

const TAG_OPTIONS = [
  'div',
  'section',
  'header',
  'footer',
  'button',
  'nav',
  'main',
  'article',
];

export function SemanticsPanel({ node, emit, readOnly = false }) {
  if (!node) return null;

  const semantic = node.props?.semantic || {};

  function updateSemantic(patch) {
    if (readOnly) return;
    emit({
      type: NodeMutationTypes.PROPS_UPDATE,
      payload: {
        nodeId: node.id,
        props: {
          semantic: {
            ...semantic,
            ...patch,
          },
        },
      },
    });
  }

  return (
    <div className="inspector-group">
      <Control label="Semantic Tag">
        <Select
          value={semantic.tag || ''}
          onChange={(e) => updateSemantic({ tag: e.target.value || null })}
          disabled={readOnly}
        >
          <option value="">Select tag</option>
          {TAG_OPTIONS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </Select>
      </Control>
      <Control label="Role (ARIA)">
        <Input
          value={semantic.role || ''}
          onChange={(e) => updateSemantic({ role: e.target.value })}
          placeholder="Optional role"
          disabled={readOnly}
        />
      </Control>
      <Control label="Label / Description">
        <Input
          value={semantic.label || ''}
          onChange={(e) => updateSemantic({ label: e.target.value })}
          placeholder="Accessible description"
          disabled={readOnly}
        />
      </Control>
    </div>
  );
}
