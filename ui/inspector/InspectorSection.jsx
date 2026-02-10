'use client';

import { useState } from 'react';
import { colors, spacing, radius, motion } from '@/ui/tokens';

export function InspectorSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: radius.sm,
        background: colors.panelBg,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.sm}px ${spacing.md}px`,
          border: 'none',
          background: 'transparent',
          fontSize: 12,
          fontWeight: 600,
          color: colors.text,
          cursor: 'pointer',
        }}
      >
        <span>{title}</span>
        <span
          style={{
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: `transform ${motion.fast}`,
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div style={{ padding: spacing.md, paddingTop: 0 }}>{children}</div>
      )}
    </section>
  );
}
