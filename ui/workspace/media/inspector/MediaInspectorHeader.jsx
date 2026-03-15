'use client';

import {
    fieldGridStyle,
    fieldLabelStyle,
    sectionStyle,
    sectionTitleStyle,
} from './inspectorStyles.js';

export function MediaInspectorHeader({ trackLabel, nodeLabel, frameLabel, timelineLabel }) {
    return (
        <div style={sectionStyle()}>
            <div style={sectionTitleStyle()}>Inspector</div>
            <div style={{ ...fieldGridStyle(), gridTemplateColumns: '72px minmax(0, 1fr)' }}>
                <span style={fieldLabelStyle()}>Track</span>
                <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{trackLabel}</span>
                <span style={fieldLabelStyle()}>Node</span>
                <span>{nodeLabel}</span>
                <span style={fieldLabelStyle()}>Frame</span>
                <span>{frameLabel}</span>
                <span style={fieldLabelStyle()}>Timeline</span>
                <span>{timelineLabel}</span>
            </div>
        </div>
    );
}
