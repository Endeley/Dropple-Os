'use client';

import {
    checkboxStyle,
    fieldGridStyle,
    fieldInputStyle,
    fieldLabelStyle,
    sectionStyle,
    sectionTitleStyle,
} from '../inspectorStyles.js';

function formatPropertyValue(track, keyframe) {
    const propertyLabel = track?.property ?? track?.id ?? 'channel';
    const value = keyframe?.value ?? 'n/a';
    return [{ label: propertyLabel, value }];
}

export function AnimationTrackInspector({ track, summary, keyframe }) {
    if (!track) return null;

    const propertyFields = formatPropertyValue(track, keyframe);

    return (
        <div style={sectionStyle()}>
            <div style={sectionTitleStyle()}>Track Settings</div>
            <div style={fieldGridStyle()}>
                {track.controllerLabel ? (
                    <>
                        <span style={fieldLabelStyle()}>Controller</span>
                        <input disabled readOnly value={track.controllerLabel} style={fieldInputStyle()} />
                    </>
                ) : null}
                <span style={fieldLabelStyle()}>Property</span>
                <input disabled readOnly value={track.property ?? track.id} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Target Node</span>
                <input disabled readOnly value={summary?.nodeId ?? 'unbound'} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Keyframes</span>
                <input disabled readOnly value={summary?.keyframeCount ?? track.keyframes.length} style={fieldInputStyle()} />
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#334155' }}>
                    <input checked disabled readOnly style={checkboxStyle()} type='checkbox' />
                    Enabled
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                    <input disabled readOnly style={checkboxStyle()} type='checkbox' />
                    Locked
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                    <input disabled readOnly style={checkboxStyle()} type='checkbox' />
                    Loop
                </label>
            </div>
            <div style={{ ...sectionStyle(), padding: '10px', background: 'rgba(241, 245, 249, 0.8)' }}>
                <div style={sectionTitleStyle()}>Transform</div>
                <div style={fieldGridStyle()}>
                    {propertyFields.map((field) => (
                        <div
                            key={field.label}
                            style={{ display: 'contents' }}>
                            <span style={fieldLabelStyle()}>{field.label}</span>
                            <input disabled readOnly value={String(field.value)} style={fieldInputStyle()} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
