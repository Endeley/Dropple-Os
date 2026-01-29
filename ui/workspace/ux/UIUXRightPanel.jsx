'use client';

import { CanvasSurfacePanel } from './panels/CanvasSurfacePanel.jsx';

export function UIUXRightPanel() {
  return (
    <aside className="uiux-rightpanel">
      <div className="panel-tabs">
        <button className="active">Inspector</button>
        <button>Validation</button>
        <button>Suggestions</button>
      </div>

      <div className="panel-content">
        <p>Select a node to inspect.</p>
        <CanvasSurfacePanel />
      </div>
    </aside>
  );
}
