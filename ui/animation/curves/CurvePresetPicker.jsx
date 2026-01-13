"use client";

const presets = [
  { id: "linear", label: "Linear" },
  { id: "ease-in", label: "Ease In" },
  { id: "ease-out", label: "Ease Out" },
  { id: "ease-in-out", label: "Ease In-Out" },
];

export default function CurvePresetPicker({ easing, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelect?.(preset.id)}
          style={{
            padding: "4px 8px",
            fontSize: 12,
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            background: easing === preset.id ? "#e2e8f0" : "#ffffff",
            cursor: "pointer",
          }}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
