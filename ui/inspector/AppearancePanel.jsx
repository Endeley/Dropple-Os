'use client';

import { Control, Input, Select } from '@/ui/Control';

const FILL_PRESET_OPTIONS = Object.freeze([
    { value: '#e5e7eb', label: 'Default' },
    { value: 'token.color.primary', label: 'Primary Token' },
    { value: 'token.color.secondary', label: 'Secondary Token' },
    { value: 'custom', label: 'Custom Color' },
]);

function normalizeHexColor(value, fallback) {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(trimmed) ? trimmed : fallback;
}

function normalizeStroke(stroke) {
    if (!stroke) return null;

    if (typeof stroke === 'string') {
        return {
            color: normalizeHexColor(stroke, '#000000'),
            width: 1,
        };
    }

    if (typeof stroke === 'object') {
        return {
            color: normalizeHexColor(stroke.color, '#000000'),
            width: Number.isFinite(stroke.width) ? Math.max(0, stroke.width) : 1,
        };
    }

    return null;
}

export function AppearancePanel({ node, emit, readOnly = false }) {
    if (!node) return null;

    const style = node?.style || {};
    const fills = Array.isArray(style.fills) ? style.fills : [];
    const rawPrimaryFill = fills.find((entry) => entry?.enabled !== false)?.color ?? style.fill;
    const isTokenFill = typeof rawPrimaryFill === 'string' && rawPrimaryFill.startsWith('token.');
    const fillPreset = isTokenFill
        ? (FILL_PRESET_OPTIONS.some((entry) => entry.value === rawPrimaryFill) ? rawPrimaryFill : 'custom')
        : (normalizeHexColor(rawPrimaryFill, '#e5e7eb') === '#e5e7eb' && rawPrimaryFill !== '#e5e7eb' ? 'custom' : (rawPrimaryFill || '#e5e7eb'));
    const primaryFill = normalizeHexColor(rawPrimaryFill, '#e5e7eb');
    const opacity = Number.isFinite(style.opacity) ? Math.max(0, Math.min(style.opacity, 1)) : 1;
    const strokes = Array.isArray(style.strokes) ? style.strokes : [];
    const primaryStroke = normalizeStroke(
        strokes.find((entry) => entry?.enabled !== false) ?? style.stroke,
    );

    function updateStyle(patch) {
        if (readOnly) return;

        emit({
            type: 'node.style.update',
            payload: {
                nodeId: node.id,
                style: patch,
            },
        });
    }

    function updateFill(color) {
        updateStyle({
            fills: [
                {
                    type: 'solid',
                    color,
                    enabled: true,
                },
            ],
            fill: color,
        });
    }

    function handleFillPresetChange(value) {
        if (value === 'custom') return;
        updateFill(value);
    }

    function updateStroke(stroke) {
        if (!stroke) {
            updateStyle({
                strokes: [],
                stroke: null,
            });
            return;
        }

        const normalized = {
            color: normalizeHexColor(stroke.color, '#000000'),
            width: Number.isFinite(stroke.width) ? Math.max(0, stroke.width) : 1,
            enabled: stroke.enabled !== false,
        };

        updateStyle({
            strokes: [normalized],
            stroke: {
                color: normalized.color,
                width: normalized.width,
            },
        });
    }

    return (
        <div className="inspector-group">
            <Control label='Fill'>
                <Select
                    value={fillPreset}
                    onChange={(e) => handleFillPresetChange(e.target.value)}
                    disabled={readOnly}>
                    {FILL_PRESET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
            </Control>

            <Control label='Fill Color'>
                <Input
                    type='color'
                    value={primaryFill}
                    onChange={(e) => updateFill(e.target.value)}
                    disabled={readOnly}
                />
            </Control>

            <Control label='Opacity'>
                <Input
                    type='range'
                    min={0}
                    max={1}
                    step={0.01}
                    value={opacity}
                    onChange={(e) => updateStyle({ opacity: Number(e.target.value) })}
                    disabled={readOnly}
                />
            </Control>

            <Control label='Stroke'>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <button
                        className="inspector-button"
                        type='button'
                        onClick={() => updateStroke(primaryStroke ? null : { color: '#000000', width: 1, enabled: true })}
                        disabled={readOnly}
                        style={{
                            fontSize: 13,
                            opacity: readOnly ? 0.5 : 1,
                        }}>
                        {primaryStroke ? 'Remove' : 'Add'}
                    </button>

                    {primaryStroke && (
                        <>
                            <Input
                                type='color'
                                value={primaryStroke.color}
                                onChange={(e) =>
                                    updateStroke({
                                        ...primaryStroke,
                                        color: e.target.value,
                                    })
                                }
                                disabled={readOnly}
                            />
                            <Input
                                type='number'
                                min={0}
                                step={1}
                                value={primaryStroke.width}
                                onChange={(e) =>
                                    updateStroke({
                                        ...primaryStroke,
                                        width: Number(e.target.value),
                                    })
                                }
                                disabled={readOnly}
                            />
                        </>
                    )}
                </div>
            </Control>
        </div>
    );
}
