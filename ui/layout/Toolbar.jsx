'use client';

import { useGrid } from '@/ui/workspace/shared/GridContext';
import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { CapabilityActions } from '@/ui/capabilities/capabilityActions';
import { exportJSON } from '@/export/exportJSON';
import { exportSVG } from '@/export/svg/exportSVG';
import { exportPNG } from '@/export/png/exportPNG';
import { createShareLink } from '@/share/createShareLink';
import { createEmbedCode } from '@/share/createEmbedCode';
import { colors, spacing, radius } from '@/ui/tokens';

export default function Toolbar({
  mode,
  onOpenTemplateGenerator,
  emit,
  getState,
  events,
  cursor,
  documentName,
  onSave,
  onSaveAs,
  recentDocs = [],
  onOpenDocument,
  canPersist = true,
  onImportJSONReplace,
  onImportJSONMerge,
  onImportSVGReplace,
  onImportSVGMerge,
  canImport = true,
}) {
  const { grid, toggleGrid } = useGrid();
  const { selectedIds } = useSelection();

  const state = getState?.();
  const nodes = state?.nodes || {};
  const selected =
    selectedIds && selectedIds.size > 1
      ? Array.from(selectedIds).map((id) => nodes[id]).filter(Boolean)
      : [];
  const enabled = selected.length > 1;
  const hasNodes = Object.keys(nodes).length > 0;
  const showDocumentActions = canPersist;
  const showImportActions = canImport;

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
      {showDocumentActions && (
        <>
          <button
            onClick={() => onSave?.()}
            title={`Save ${documentName || 'Document'}`}
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
            Save
          </button>
          <button
            onClick={() => onSaveAs?.()}
            title="Save As"
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
            Save As
          </button>
          {recentDocs.length > 0 && (
            <select
              defaultValue=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                onOpenDocument?.(id);
                e.target.value = '';
              }}
              style={{
                height: 32,
                padding: `0 ${spacing.sm}px`,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.sm,
                background: '#fff',
                fontSize: 12,
              }}
            >
              <option value="">Open Recent…</option>
              {recentDocs.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          )}
        </>
      )}
      {showImportActions && (
        <>
          <button
            onClick={() => onImportJSONReplace?.()}
            title="Import JSON (replace)"
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
            Import JSON
          </button>
          <button
            onClick={() => onImportJSONMerge?.()}
            title="Import JSON (merge)"
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
            Import JSON +
          </button>
          <button
            onClick={() => onImportSVGReplace?.()}
            title="Import SVG (replace)"
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
            Import SVG
          </button>
          <button
            onClick={() => onImportSVGMerge?.()}
            title="Import SVG (merge)"
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
            Import SVG +
          </button>
        </>
      )}
      <button
        disabled={!enabled}
        onClick={() => CapabilityActions.alignLeft(selected, emit)}
        title="Align left"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
          opacity: enabled ? 1 : 0.5,
        }}
      >
        Align Left
      </button>
      <button
        disabled={!enabled}
        onClick={() => CapabilityActions.alignCenterX(selected, emit)}
        title="Align horizontal center"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
          opacity: enabled ? 1 : 0.5,
        }}
      >
        Align Center
      </button>
      <button
        disabled={!enabled}
        onClick={() => CapabilityActions.alignRight(selected, emit)}
        title="Align right"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
          opacity: enabled ? 1 : 0.5,
        }}
      >
        Align Right
      </button>
      <button
        disabled={!enabled}
        onClick={() => CapabilityActions.distributeX(selected, emit)}
        title="Distribute horizontally"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
          opacity: enabled ? 1 : 0.5,
        }}
      >
        Distribute X
      </button>
      <button
        disabled={!enabled}
        onClick={() => CapabilityActions.distributeY(selected, emit)}
        title="Distribute vertically"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
          opacity: enabled ? 1 : 0.5,
        }}
      >
        Distribute Y
      </button>
      <button
        disabled={!hasNodes}
        onClick={() => exportJSON({ nodes, events, cursor })}
        title="Export JSON"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
          opacity: hasNodes ? 1 : 0.5,
        }}
      >
        Export JSON
      </button>
      <button
        disabled={!hasNodes}
        onClick={() => exportSVG({ nodes })}
        title="Export SVG"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
          opacity: hasNodes ? 1 : 0.5,
        }}
      >
        Export SVG
      </button>
      <button
        disabled={!hasNodes}
        onClick={() => exportPNG({ nodes, scale: 2 })}
        title="Export PNG"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
          opacity: hasNodes ? 1 : 0.5,
        }}
      >
        Export PNG
      </button>
      <button
        disabled={!hasNodes}
        onClick={async () => {
          const url = createShareLink({ events, cursorIndex: cursor?.index ?? -1 });
          if (navigator?.clipboard?.writeText) {
            try {
              await navigator.clipboard.writeText(url);
            } catch (err) {
              window.prompt('Copy share link', url);
            }
          } else {
            window.prompt('Copy share link', url);
          }
        }}
        title="Share link"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
          opacity: hasNodes ? 1 : 0.5,
        }}
      >
        Share
      </button>
      <button
        disabled={!hasNodes}
        onClick={async () => {
          const code = createEmbedCode({
            zoom: 1,
            bg: 'transparent',
            timeline: false,
            controls: false,
          });
          if (navigator?.clipboard?.writeText) {
            try {
              await navigator.clipboard.writeText(code);
            } catch (err) {
              window.prompt('Copy embed code', code);
            }
          } else {
            window.prompt('Copy embed code', code);
          }
        }}
        title="Copy embed code"
        style={{
          minWidth: 32,
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
          opacity: hasNodes ? 1 : 0.5,
        }}
      >
        Embed
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
