'use client';

import { colors, spacing } from '@/ui/tokens';

export function ExportPreviewPanel({ node }) {
  if (!node) return null;

  const semantic = node.props?.semantic || {};
  const tag = semantic.tag || '';
  const htmlTag = tag || 'div';
  const wpTag = tag || 'div';

  const warnings = [];
  if (!tag) warnings.push('Missing semantic tag');
  if (node.type === 'text' && !node.content) warnings.push('Empty text content');
  if (node.type === 'image' && !node.props?.content?.src) warnings.push('Missing image source');
  if (node.type === 'button' && !node.props?.content?.label) warnings.push('Missing button label');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      <div style={{ fontSize: 12, color: colors.textMuted }}>HTML</div>
      <div style={{ fontSize: 12, color: colors.text }}>{`<${htmlTag}>`}</div>

      <div style={{ fontSize: 12, color: colors.textMuted, marginTop: spacing.xs }}>
        WordPress
      </div>
      <div style={{ fontSize: 12, color: colors.text }}>{`<${wpTag}>`}</div>

      {warnings.length > 0 && (
        <div style={{ marginTop: spacing.sm }}>
          <div style={{ fontSize: 12, color: colors.danger, fontWeight: 600 }}>
            Warnings
          </div>
          <ul style={{ margin: `${spacing.xs}px 0 0`, paddingLeft: 16 }}>
            {warnings.map((warning) => (
              <li key={warning} style={{ fontSize: 12, color: colors.danger }}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
