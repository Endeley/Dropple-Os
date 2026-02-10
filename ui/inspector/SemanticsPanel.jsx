'use client';

import { Control, Input, Select } from '@/ui/Control';
import { spacing } from '@/ui/tokens';

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

export function SemanticsPanel({ node, emit }) {
  if (!node) return null;

  const semantic = node.props?.semantic || {};

  function updateSemantic(patch) {
    emit({
      type: 'node.props.update',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      <Control label="Semantic Tag">
        <Select
          value={semantic.tag || ''}
          onChange={(e) => updateSemantic({ tag: e.target.value || null })}
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
        />
      </Control>
      <Control label="Label / Description">
        <Input
          value={semantic.label || ''}
          onChange={(e) => updateSemantic({ label: e.target.value })}
          placeholder="Accessible description"
        />
      </Control>
    </div>
  );
}
