export function Panel({ title, children }) {
  return (
    <div className="panel-shell">
      {title && <div className="panel-title">{title}</div>}
      {children}
    </div>
  );
}
