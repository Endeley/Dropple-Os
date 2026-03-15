'use client';

import {
    fieldGridStyle,
    fieldInputStyle,
    fieldLabelStyle,
    sectionStyle,
    sectionTitleStyle,
} from '../inspectorStyles.js';

export function VideoClipInspector({ track, duration }) {
    if (!track) return null;

    const firstFrame = Number(track.keyframes?.[0]?.time ?? 0);
    const lastFrame = Number(track.keyframes?.[track.keyframes.length - 1]?.time ?? duration ?? 0);

    return (
        <div style={sectionStyle()}>
            <div style={sectionTitleStyle()}>Video Context</div>
            <div style={fieldGridStyle()}>
                <span style={fieldLabelStyle()}>Clip</span>
                <input disabled readOnly value={track.clipId ?? track.id} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Track</span>
                <input disabled readOnly value={track.property ?? track.id} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Start Frame</span>
                <input disabled readOnly value={firstFrame} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>End Frame</span>
                <input disabled readOnly value={lastFrame} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Speed</span>
                <input disabled readOnly value='1.0x' style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Volume</span>
                <input disabled readOnly value='100%' style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Opacity</span>
                <input disabled readOnly value='100%' style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Fade In</span>
                <input disabled readOnly value='0.0s' style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Fade Out</span>
                <input disabled readOnly value='0.0s' style={fieldInputStyle()} />
            </div>
        </div>
    );
}
