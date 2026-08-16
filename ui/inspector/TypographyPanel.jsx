'use client';

import { NodeMutationTypes } from '@/core/events/nodeMutationTypes.js';
import { Control, Input, Select } from '@/ui/Control';

const FONT_WEIGHT_OPTIONS = Object.freeze([
  { value: '100', label: 'Thin' },
  { value: '200', label: 'Extra Light' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
]);

const FONT_FAMILY_OPTIONS = Object.freeze([
  { value: 'sans-serif', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
]);

const TEXT_ALIGN_OPTIONS = Object.freeze([
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'justify', label: 'Justify' },
]);

const TEXT_VERTICAL_ALIGN_OPTIONS = Object.freeze([
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Middle' },
  { value: 'bottom', label: 'Bottom' },
]);

const TEXT_WRAP_OPTIONS = Object.freeze([
  { value: 'wrap', label: 'Wrap' },
  { value: 'nowrap', label: 'Single Line' },
]);

const TEXT_SIZING_MODE_OPTIONS = Object.freeze([
  { value: 'auto-width', label: 'Auto Width' },
  { value: 'fixed-width', label: 'Fixed Width' },
]);

const FONT_STYLE_OPTIONS = Object.freeze([
  { value: 'normal', label: 'Normal' },
  { value: 'italic', label: 'Italic' },
  { value: 'oblique', label: 'Oblique' },
]);

const TEXT_DECORATION_OPTIONS = Object.freeze([
  { value: 'none', label: 'None' },
  { value: 'underline', label: 'Underline' },
  { value: 'line-through', label: 'Strikethrough' },
]);

const TEXT_TRANSFORM_OPTIONS = Object.freeze([
  { value: 'none', label: 'Normal Case' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
]);

function coercePositiveNumber(value, fallback, minimum = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, parsed);
}

export function TypographyPanel({ node, emit, readOnly = false }) {
  if (!node || node.type !== 'text') return null;

  const style = node.style || {};
  const contentProps = node.props?.content || {};
  const fontFamily = typeof style.fontFamily === 'string' && style.fontFamily.trim().length > 0
    ? style.fontFamily
    : 'sans-serif';
  const fontSize = coercePositiveNumber(style.fontSize, 16, 1);
  const fontWeight = String(style.fontWeight ?? '400');
  const fontStyle = ['italic', 'oblique'].includes(style.fontStyle) ? style.fontStyle : 'normal';
  const textDecoration =
    ['underline', 'line-through'].includes(style.textDecorationLine) ? style.textDecorationLine : 'none';
  const textTransform =
    ['uppercase', 'lowercase', 'capitalize'].includes(style.textTransform) ? style.textTransform : 'none';
  const lineHeight = coercePositiveNumber(style.lineHeight, 1.4, 0.5);
  const letterSpacing = Number.isFinite(style.letterSpacing) ? style.letterSpacing : 0;
  const textAlign = contentProps.align || 'left';
  const textVerticalAlign =
    ['top', 'center', 'bottom'].includes(contentProps.verticalAlign) ? contentProps.verticalAlign : 'top';
  const textSizingMode = contentProps.sizingMode === 'auto-width' ? 'auto-width' : 'fixed-width';
  const textWrap = textSizingMode === 'auto-width'
    ? 'nowrap'
    : (contentProps.wrap === false ? 'nowrap' : 'wrap');

  function updateStyle(patch) {
    if (readOnly) return;
    emit({
      type: NodeMutationTypes.STYLE_UPDATE,
      payload: {
        nodeId: node.id,
        style: patch,
      },
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
      <div className="inspector-row">
        <Control label="Family">
          <Select
            data-testid="text-font-family-select"
            value={fontFamily}
            onChange={(e) => updateStyle({ fontFamily: e.target.value })}
            disabled={readOnly}
          >
            {FONT_FAMILY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Control>
        <Control label="Font size">
          <Input
            data-testid="text-font-size-input"
            type="number"
            min={1}
            step={1}
            value={fontSize}
            onChange={(e) => updateStyle({ fontSize: coercePositiveNumber(e.target.value, fontSize, 1) })}
            disabled={readOnly}
          />
        </Control>
        <Control label="Weight">
          <Select
            data-testid="text-font-weight-select"
            value={fontWeight}
            onChange={(e) => updateStyle({ fontWeight: Number(e.target.value) })}
            disabled={readOnly}
          >
            {FONT_WEIGHT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Control>
      </div>

      <div className="inspector-row">
        <Control label="Style">
          <Select
            data-testid="text-font-style-select"
            value={fontStyle}
            onChange={(e) => updateStyle({ fontStyle: e.target.value })}
            disabled={readOnly}
          >
            {FONT_STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Control>
        <Control label="Decoration">
          <Select
            data-testid="text-decoration-select"
            value={textDecoration}
            onChange={(e) => updateStyle({ textDecorationLine: e.target.value })}
            disabled={readOnly}
          >
            {TEXT_DECORATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Control>
      </div>

      <div className="inspector-row">
        <Control label="Case">
          <Select
            data-testid="text-transform-select"
            value={textTransform}
            onChange={(e) => updateStyle({ textTransform: e.target.value })}
            disabled={readOnly}
          >
            {TEXT_TRANSFORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Control>
        <Control label="Align">
          <Select
            data-testid="text-align-select"
            value={textAlign}
            onChange={(e) => updateContentProps({ align: e.target.value })}
            disabled={readOnly}
          >
            {TEXT_ALIGN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Control>
        <Control label="Vertical">
          <Select
            data-testid="text-vertical-align-select"
            value={textVerticalAlign}
            onChange={(e) => updateContentProps({ verticalAlign: e.target.value })}
            disabled={readOnly}
          >
            {TEXT_VERTICAL_ALIGN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Control>
      </div>

      <div className="inspector-row">
        <Control label="Width Mode">
          <Select
            data-testid="text-sizing-mode-select"
            value={textSizingMode}
            onChange={(e) =>
              updateContentProps(
                e.target.value === 'auto-width'
                  ? { sizingMode: 'auto-width', wrap: false }
                  : { sizingMode: 'fixed-width' }
              )
            }
            disabled={readOnly}
          >
            {TEXT_SIZING_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Control>
        <Control label="Box">
          <Select
            data-testid="text-wrap-select"
            value={textWrap}
            onChange={(e) => updateContentProps({ wrap: e.target.value !== 'nowrap' })}
            disabled={readOnly || textSizingMode === 'auto-width'}
          >
            {TEXT_WRAP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Control>
        <Control label="Line height">
          <Input
            data-testid="text-line-height-input"
            type="number"
            min={0.5}
            step={0.1}
            value={lineHeight}
            onChange={(e) => updateStyle({ lineHeight: coercePositiveNumber(e.target.value, lineHeight, 0.5) })}
            disabled={readOnly}
          />
        </Control>
        <Control label="Letter spacing">
          <Input
            data-testid="text-letter-spacing-input"
            type="number"
            step={0.1}
            value={letterSpacing}
            onChange={(e) => {
              const nextValue = Number(e.target.value);
              updateStyle({ letterSpacing: Number.isFinite(nextValue) ? nextValue : 0 });
            }}
            disabled={readOnly}
          />
        </Control>
      </div>
    </div>
  );
}
