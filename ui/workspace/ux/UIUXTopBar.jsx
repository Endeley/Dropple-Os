'use client';

export function UIUXTopBar() {
  return (
    <header className="uiux-topbar">
      <div className="uiux-topbar-left">
        <span className="workspace-name">UI/UX Design</span>
      </div>

      <div className="uiux-topbar-center">
        <span className="frame-indicator">Frame: —</span>
      </div>

      <div className="uiux-topbar-right">
        <button disabled>Export</button>
      </div>
    </header>
  );
}
