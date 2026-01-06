// timeline/playback/PlaybackControls.jsx

import React from 'react';

/**
 * Timeline Playback Controls UI.
 *
 * 🔒 Rules:
 * - UI-only
 * - No reducers
 * - No persistence
 */
export default function PlaybackControls({ playback, showSpeed = true, showLoop = true }) {
    if (!playback) {
        throw new Error('PlaybackControls: playback controller is required');
    }

    const state = playback.getState();

    const togglePlay = () => {
        if (state.playing) {
            playback.pause();
        } else {
            playback.play();
        }
    };

    const toggleLoop = () => {
        playback.setLoop(!state.loop);
    };

    const changeSpeed = (e) => {
        playback.setSpeed(Number(e.target.value));
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.35)',
                userSelect: 'none',
            }}
        >
            {/* Play / Pause */}
            <button onClick={togglePlay} style={buttonStyle} title={state.playing ? 'Pause' : 'Play'}>
                {state.playing ? '⏸' : '▶'}
            </button>

            {/* Loop */}
            {showLoop && (
                <button
                    onClick={toggleLoop}
                    style={{
                        ...buttonStyle,
                        opacity: state.loop ? 1 : 0.5,
                    }}
                    title="Loop"
                >
                    🔁
                </button>
            )}

            {/* Speed */}
            {showSpeed && (
                <select value={state.speed} onChange={changeSpeed} style={selectStyle} title="Playback speed">
                    <option value={0.25}>0.25×</option>
                    <option value={0.5}>0.5×</option>
                    <option value={1}>1×</option>
                    <option value={2}>2×</option>
                    <option value={4}>4×</option>
                </select>
            )}
        </div>
    );
}

const buttonStyle = {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: 4,
    padding: '4px 8px',
    cursor: 'pointer',
};

const selectStyle = {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 4,
    padding: '4px 6px',
    cursor: 'pointer',
};
