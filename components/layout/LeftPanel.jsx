export default function LeftPanel({ panels = [] }) {
  return (
    <aside className="left-panel">
      LeftPanel
      <ul>
        {panels?.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </aside>
  );
}
