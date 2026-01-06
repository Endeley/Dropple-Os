'use client';

// stability/EditorErrorBoundary.jsx

import React from 'react';
import { resetRuntimeState } from '@/runtime/state/runtimeState';

export class EditorErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('[EditorErrorBoundary]', error, info);
    }

    recover = () => {
        // 🔒 Reset runtime safely
        resetRuntimeState();
        this.setState({ error: null });
    };

    render() {
        if (this.state.error) {
            return (
                <div
                    style={{
                        padding: 16,
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.4)',
                        borderRadius: 6,
                        color: '#fff',
                    }}
                >
                    <strong>Canvas error</strong>
                    <div style={{ opacity: 0.7, marginTop: 4 }}>The editor canvas encountered an error.</div>

                    <button
                        onClick={this.recover}
                        style={{
                            marginTop: 8,
                            ...buttonStyle,
                        }}
                    >
                        Reset editor
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const buttonStyle = {
    padding: '6px 12px',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(59,130,246,0.25)',
    color: '#fff',
    cursor: 'pointer',
};
