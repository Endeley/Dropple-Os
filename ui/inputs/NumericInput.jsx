'use client';

export function NumericInput({ label, value, onChange, step = 1, min, disabled = false }) {
    const safeValue = Number.isFinite(value) ? value : 0;

    return (
        <label
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                opacity: disabled ? 0.5 : 1,
            }}
        >
            <span style={{ width: 12 }}>{label}</span>
            <input
                type="number"
                value={safeValue}
                step={step}
                min={min}
                disabled={disabled}
                onChange={(e) => {
                    const next = Number(e.target.value);
                    if (!Number.isFinite(next)) return;
                    onChange?.(next);
                }}
                style={{
                    width: 64,
                    fontSize: 12,
                    padding: '2px 4px',
                }}
            />
        </label>
    );
}
