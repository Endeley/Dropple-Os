'use client';

import { useGrid } from '@/components/workspace/GridContext';
import { colors, spacing, radius } from '@/ui/tokens';

export default function Toolbar({ mode, onOpenTemplateGenerator }) {
  const { grid, toggleGrid } = useGrid();

  return (
    <div
      className="toolbar"
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        padding: `0 ${spacing.lg}px`,
        borderBottom: `1px solid ${colors.border}`,
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 13, color: colors.textMuted }}>{mode.id}</div>
      <button
        onClick={toggleGrid}
        aria-pressed={grid.enabled}
        title="Toggle grid snapping"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
        }}
      >
        Grid
      </button>
      {mode?.id === 'design' && onOpenTemplateGenerator ? (
        <button
          onClick={onOpenTemplateGenerator}
          title="Publish as template"
          style={{
            minWidth: 32,
            height: 32,
            padding: `0 ${spacing.sm}px`,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.sm,
            background: '#fff',
            fontSize: 12,
          }}
        >
          Publish as Template
        </button>
      ) : null}
    </div>
  );
}
