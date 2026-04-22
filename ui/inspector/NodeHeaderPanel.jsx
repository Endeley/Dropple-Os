'use client';

import { useState } from 'react';

function Row({ label, value, onCopy }) {
  return (
    <div className="node-header-row">
      <span className="node-header-row__label">{label}</span>
      <span className="node-header-row__valueWrap">
        <span>{value ?? '—'}</span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="node-header-row__copyBtn"
          >
            Copy
          </button>
        )}
      </span>
    </div>
  );
}

export function NodeHeaderPanel({ node, parentId, childCount }) {
  const [copied, setCopied] = useState(false);

  function copyId() {
    const id = node?.id;
    if (!id) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(id).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 900);
      });
    }
  }

  return (
    <div className="node-header-panel">
      <Row label="Node Type" value={node?.type} />
      <Row
        label="Node ID"
        value={copied ? 'Copied' : node?.id}
        onCopy={copyId}
      />
      <Row label="Parent ID" value={parentId} />
      <Row label="Children" value={childCount} />
    </div>
  );
}
