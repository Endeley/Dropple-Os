'use client';

import { useState } from 'react';

export function InspectorSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="inspector-section">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inspector-section__toggle"
      >
        <span>{title}</span>
        <span className={`inspector-section__chevron ${open ? 'is-open' : ''}`}>
          ▾
        </span>
      </button>
      {open && <div className="inspector-section__content">{children}</div>}
    </section>
  );
}
