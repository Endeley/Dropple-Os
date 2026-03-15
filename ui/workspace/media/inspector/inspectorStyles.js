export function cardStyle() {
    return {
        borderRadius: 14,
        border: '1px solid rgba(148, 163, 184, 0.35)',
        background: 'rgba(248, 250, 252, 0.92)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 14px 34px rgba(15, 23, 42, 0.12)',
        padding: '12px 14px',
    };
}

export function sectionStyle() {
    return {
        borderRadius: 12,
        border: '1px solid rgba(148, 163, 184, 0.24)',
        background: 'rgba(255, 255, 255, 0.74)',
        padding: '10px 12px',
        display: 'grid',
        gap: 8,
    };
}

export function sectionTitleStyle() {
    return {
        fontSize: 11,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontWeight: 700,
    };
}

export function fieldGridStyle() {
    return {
        display: 'grid',
        gridTemplateColumns: '88px minmax(0, 1fr)',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        color: '#334155',
    };
}

export function fieldLabelStyle() {
    return {
        color: '#64748b',
        fontSize: 12,
        fontWeight: 600,
    };
}

export function fieldInputStyle() {
    return {
        width: '100%',
        minWidth: 0,
        borderRadius: 8,
        border: '1px solid rgba(148, 163, 184, 0.4)',
        background: '#fff',
        color: '#0f172a',
        padding: '8px 10px',
        fontSize: 12,
    };
}

export function actionRowStyle() {
    return {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 8,
    };
}

export function actionButtonStyle({ disabled = false, danger = false } = {}) {
    return {
        borderRadius: 10,
        border: danger ? '1px solid rgba(220, 38, 38, 0.25)' : '1px solid rgba(148, 163, 184, 0.35)',
        background: disabled
            ? 'rgba(226, 232, 240, 0.7)'
            : danger
              ? 'rgba(254, 242, 242, 0.95)'
              : 'rgba(255,255,255,0.95)',
        color: disabled ? '#94a3b8' : danger ? '#b91c1c' : '#0f172a',
        padding: '8px 10px',
        fontSize: 12,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
    };
}

export function checkboxStyle() {
    return {
        width: 14,
        height: 14,
        margin: 0,
    };
}
