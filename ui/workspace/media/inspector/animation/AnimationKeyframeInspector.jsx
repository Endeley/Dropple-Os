'use client';

import {
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

export function AnimationKeyframeInspector({ keyframe, onPatchKeyframe }) {
    if (!keyframe) return null;

    const isBezier = String(keyframe.interpolation || keyframe.easing).toLowerCase() === 'bezier';
    const handleIn = keyframe.handleIn ?? {};
    const handleOut = keyframe.handleOut ?? {};

    return (
        <div style={sectionStyle()}>
            <div style={sectionTitleStyle()}>Keyframe</div>
            <div style={fieldGridStyle()}>
                <label style={fieldLabelStyle()} htmlFor='animation-keyframe-frame'>
                    Frame
                </label>
                <input
                    id='animation-keyframe-frame'
                    key={`${keyframe.id}-frame`}
                    type='number'
                    defaultValue={keyframe.time}
                    onBlur={(event) => {
                        const nextValue = Number(event.target.value);
                        if (Number.isFinite(nextValue)) {
                            onPatchKeyframe({ time: nextValue });
                        }
                    }}
                    style={fieldInputStyle()}
                />
                <label style={fieldLabelStyle()} htmlFor='animation-keyframe-value'>
                    Value
                </label>
                <input
                    id='animation-keyframe-value'
                    key={`${keyframe.id}-value`}
                    type='text'
                    defaultValue={String(keyframe.value ?? '')}
                    onBlur={(event) => {
                        const rawValue = event.target.value;
                        const numericValue = Number(rawValue);
                        onPatchKeyframe({
                            value: Number.isFinite(numericValue) && rawValue.trim() !== '' ? numericValue : rawValue,
                        });
                    }}
                    style={fieldInputStyle()}
                />
                <label style={fieldLabelStyle()} htmlFor='animation-keyframe-interpolation'>
                    Interpolation
                </label>
                <select
                    id='animation-keyframe-interpolation'
                    value={keyframe.easing || 'linear'}
                    onChange={(event) => onPatchKeyframe({ easing: event.target.value })}
                    style={fieldInputStyle()}>
                    {EASING_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {prettyEasingLabel(option)}
                        </option>
                    ))}
                </select>
            </div>
            {isBezier ? (
                <div style={{ ...sectionStyle(), padding: '10px', background: 'rgba(241, 245, 249, 0.8)' }}>
                    <div style={sectionTitleStyle()}>Bezier Curve</div>
                    <div style={fieldGridStyle()}>
                        <span style={fieldLabelStyle()}>Handle In X</span>
                        <input disabled value={handleIn.x ?? ''} readOnly style={fieldInputStyle()} />
                        <span style={fieldLabelStyle()}>Handle In Y</span>
                        <input disabled value={handleIn.y ?? ''} readOnly style={fieldInputStyle()} />
                        <span style={fieldLabelStyle()}>Handle Out X</span>
                        <input disabled value={handleOut.x ?? ''} readOnly style={fieldInputStyle()} />
                        <span style={fieldLabelStyle()}>Handle Out Y</span>
                        <input disabled value={handleOut.y ?? ''} readOnly style={fieldInputStyle()} />
                    </div>
                    <div
                        aria-hidden='true'
                        style={{
                            height: 74,
                            borderRadius: 10,
                            border: '1px solid rgba(148, 163, 184, 0.28)',
                            background:
                                'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(226,232,240,0.8) 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                        <svg viewBox='0 0 120 74' width='100%' height='100%' preserveAspectRatio='none'>
                            <path d='M10 64 C 30 64, 52 40, 72 24 S 100 10, 110 10' fill='none' stroke='#0f766e' strokeWidth='3' />
                            <circle cx='10' cy='64' r='5' fill='#0f172a' />
                            <circle cx='110' cy='10' r='5' fill='#0f172a' />
                        </svg>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
