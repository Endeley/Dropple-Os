
export default function TopBar({ modeLabel }) {
  return (
    <div
      className="top-bar"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
    >
      <div>
        <strong>Dropple</strong> · Mode: {modeLabel}
      </div>
    </div>
  );
}
