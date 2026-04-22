'use client';

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
    <div className="inspector-group">
      <div className="inspector-muted" style={{ fontSize: 12 }}>
        HTML
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{`<${htmlTag}>`}</div>

      <div className="inspector-muted" style={{ fontSize: 12, marginTop: 'var(--space-xs)' }}>
        WordPress
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{`<${wpTag}>`}</div>

      {warnings.length > 0 && (
        <div className="inspector-group" style={{ marginTop: 'var(--space-sm)' }}>
          <div className="inspector-danger" style={{ fontSize: 12, fontWeight: 600 }}>
            Warnings
          </div>
          <ul style={{ margin: 'var(--space-xs) 0 0', paddingLeft: 16 }}>
            {warnings.map((warning) => (
              <li key={warning} className="inspector-danger" style={{ fontSize: 12 }}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
