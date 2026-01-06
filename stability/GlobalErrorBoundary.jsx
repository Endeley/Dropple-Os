'use client';

// stability/GlobalErrorBoundary.jsx

import React from 'react';

export class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('[GlobalErrorBoundary]', error, info);
    }

    reset = () => {
        this.setState({ error: null });
    };

    render() {
        if (this.state.error) {
            return (
                <div
                    style={{
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#020617',
                        color: '#fff',
                        padding: 24,
                        textAlign: 'center',
                    }}
                >
                    <div>
                        <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>

                        <p style={{ opacity: 0.7, marginBottom: 16 }}>The editor ran into an unexpected error.</p>

                        <button onClick={this.reset} style={buttonStyle}>
                            Try to recover
                        </button>

                        <button onClick={() => location.reload()} style={{ ...buttonStyle, marginLeft: 8 }}>
                            Reload app
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const buttonStyle = {
    padding: '8px 14px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(59,130,246,0.25)',
    color: '#fff',
    cursor: 'pointer',
};
