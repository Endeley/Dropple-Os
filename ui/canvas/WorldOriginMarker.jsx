'use client';

const __DEV__ = process.env.NODE_ENV !== 'production';

export function WorldOriginMarker({ viewport }) {
    if (!__DEV__) return null;
    if (!viewport) return null;

    const { x: vx, y: vy, scale: vs } = viewport;

    if (!Number.isFinite(vx) || !Number.isFinite(vy) || !Number.isFinite(vs)) {
        return null;
    }

    // World (0,0) -> screen
    const left = -vx * vs;
    const top = -vy * vs;

    if (!Number.isFinite(left) || !Number.isFinite(top)) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                left,
                top,
                pointerEvents: 'none',
                zIndex: 1,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    width: 12,
                    height: 1,
                    background: '#ff4d4f',
                    left: -6,
                    top: 0,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    width: 1,
                    height: 12,
                    background: '#ff4d4f',
                    left: 0,
                    top: -6,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    fontSize: 10,
                    color: '#ff4d4f',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                }}
            >
                (0,0)
            </div>
        </div>
    );
}
