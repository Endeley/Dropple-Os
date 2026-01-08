export default function TopBar({ modeLabel }) {
  return (
    <div className="top-bar">
      <strong>Dropple</strong> · Mode: {modeLabel}
    </div>
  );
}
