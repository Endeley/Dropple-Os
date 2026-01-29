'use client';

export function UIUXToolRail() {
  return (
    <aside className="uiux-toolrail">
      <div className="tool-group">
        <button>Frame</button>
      </div>

      <div className="tool-group">
        <button>Select</button>
        <button>Pan</button>
        <button>Zoom</button>
      </div>

      <div className="tool-group">
        <button>Text</button>
        <button>Rect</button>
        <button>Image</button>
        <button>Input</button>
        <button>Button</button>
      </div>
    </aside>
  );
}
