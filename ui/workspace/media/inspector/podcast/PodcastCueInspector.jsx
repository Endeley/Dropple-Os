'use client';

import {
    fieldGridStyle,
    fieldInputStyle,
    fieldLabelStyle,
    sectionStyle,
    sectionTitleStyle,
} from '../inspectorStyles.js';

function formatTimecode(frame) {
    const totalSeconds = Math.max(0, Math.floor(Number(frame ?? 0) / 60));
    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `00:${minutes}:${seconds}`;
}

export function PodcastCueInspector({ track, keyframe, currentFrame }) {
    if (!track) return null;

    const cueFrame = Number(keyframe?.time ?? currentFrame ?? 0);

    return (
        <div style={sectionStyle()}>
            <div style={sectionTitleStyle()}>Podcast Context</div>
            <div style={fieldGridStyle()}>
                <span style={fieldLabelStyle()}>Track</span>
                <input disabled readOnly value={track.property ?? track.id} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Cue</span>
                <input disabled readOnly value={keyframe?.id ?? 'Segment Marker'} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Frame</span>
                <input disabled readOnly value={cueFrame} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Time</span>
                <input disabled readOnly value={formatTimecode(cueFrame)} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Gain</span>
                <input disabled readOnly value='+0db' style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Noise Reduction</span>
                <input disabled readOnly value='Off' style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Mute</span>
                <input disabled readOnly value='No' style={fieldInputStyle()} />
            </div>
        </div>
    );
}
