'use client';

import {
    actionButtonStyle,
    fieldGridStyle,
    fieldInputStyle,
    fieldLabelStyle,
    sectionStyle,
    sectionTitleStyle,
} from '../inspectorStyles.js';

const EASING_OPTIONS = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'bezier', 'spring'];

function prettyEasingLabel(value) {
    return value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function AnimationMultiKeyframeInspector({
    selectionSpan,
    batchEasing,
    offsetSelection,
    reverseSelection,
}) {
    if (!selectionSpan || selectionSpan.count < 2) return null;

    return (
        <div style={sectionStyle()}>
            <div style={sectionTitleStyle()}>Multi-Keyframe Selection</div>
            <div style={fieldGridStyle()}>
                <span style={fieldLabelStyle()}>Selected</span>
                <input disabled readOnly value={`${selectionSpan.count} keyframes`} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>First Frame</span>
                <input disabled readOnly value={selectionSpan.first?.time ?? 0} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Last Frame</span>
                <input disabled readOnly value={selectionSpan.last?.time ?? 0} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Span</span>
                <input disabled readOnly value={`${selectionSpan.duration} frames`} style={fieldInputStyle()} />
                <label style={fieldLabelStyle()} htmlFor='animation-multi-easing'>
                    Interpolation
                </label>
                <select
                    id='animation-multi-easing'
                    defaultValue='linear'
                    onChange={(event) => batchEasing(event.target.value)}
                    style={fieldInputStyle()}>
                    {EASING_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {prettyEasingLabel(option)}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <button type='button' onClick={() => offsetSelection(-1)} style={actionButtonStyle()}>
                    Offset -1f
                </button>
                <button type='button' onClick={reverseSelection} style={actionButtonStyle()}>
                    Reverse Span
                </button>
                <button type='button' onClick={() => offsetSelection(1)} style={actionButtonStyle()}>
                    Offset +1f
                </button>
            </div>
        </div>
    );
}
