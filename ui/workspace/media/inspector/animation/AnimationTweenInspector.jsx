'use client';

import {
    fieldGridStyle,
    fieldInputStyle,
    fieldLabelStyle,
    sectionStyle,
    sectionTitleStyle,
} from '../inspectorStyles.js';

export function AnimationTweenInspector({ tweenSpan, onPatchKeyframe }) {
    if (!tweenSpan?.current || !tweenSpan?.next) return null;

    const { current, next, duration } = tweenSpan;

    return (
        <div style={sectionStyle()}>
            <div style={sectionTitleStyle()}>Tween Span</div>
            <div style={fieldGridStyle()}>
                <span style={fieldLabelStyle()}>Start Frame</span>
                <input disabled readOnly value={current.time} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>End Frame</span>
                <input disabled readOnly value={next.time} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Duration</span>
                <input disabled readOnly value={`${duration} frames`} style={fieldInputStyle()} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <button
                    type='button'
                    onClick={() => onPatchKeyframe({ easing: 'ease-in-out' })}
                    style={{
                        borderRadius: 10,
                        border: '1px solid rgba(148, 163, 184, 0.35)',
                        background: 'rgba(255,255,255,0.95)',
                        color: '#0f172a',
                        padding: '8px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}>
                    Change Easing
                </button>
                <button
                    type='button'
                    disabled
                    style={{
                        borderRadius: 10,
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        background: 'rgba(226, 232, 240, 0.7)',
                        color: '#94a3b8',
                        padding: '8px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'not-allowed',
                    }}>
                    Split Tween
                </button>
                <button
                    type='button'
                    onClick={() => onPatchKeyframe({ easing: 'ease-out' })}
                    style={{
                        borderRadius: 10,
                        border: '1px solid rgba(148, 163, 184, 0.35)',
                        background: 'rgba(255,255,255,0.95)',
                        color: '#0f172a',
                        padding: '8px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}>
                    Reverse Feel
                </button>
            </div>
        </div>
    );
}
