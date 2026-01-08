export default function RightPanel({ panels = [] }) {
  return (
    <aside className="right-panel">
      RightPanel
      <ul>
        {panels?.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </aside>
  );
}
