'use client';

import { EMBED_PRESETS } from '@/share/embedPresets';
import { createEmbedCodeFromPreset } from '@/share/createEmbedCode';

export function EmbedPresetsMenu() {
  return (
    <div style={{ padding: 8, display: 'grid', gap: 6 }}>
      {Object.entries(EMBED_PRESETS).map(([key, preset]) => (
        <button
          key={key}
          type="button"
          style={{
            textAlign: 'left',
            padding: 8,
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: '#fff',
          }}
          onClick={() => {
            const code = createEmbedCodeFromPreset(key);
            if (navigator?.clipboard?.writeText) {
              navigator.clipboard.writeText(code);
            } else {
              window.prompt('Copy embed code', code);
            }
          }}
        >
          <div style={{ fontWeight: 600 }}>{preset.label}</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            {preset.description}
          </div>
        </button>
      ))}
    </div>
  );
}
