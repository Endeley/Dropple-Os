'use client';

import { useEffect, useMemo, useState } from 'react';
import { filterCommands } from './filterCommands';
import { groupByCategory } from './groupCommands';

export function CommandPalette({ commands, context, onClose }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  const filtered = useMemo(
    () => filterCommands(commands, query, context),
    [commands, query, context]
  );
  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);
  const flat = useMemo(() => Object.values(grouped).flat(), [grouped]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, Math.max(0, flat.length - 1)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        const cmd = flat[index];
        if (cmd) {
          cmd.run(context);
          onClose();
        }
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flat, index, context, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.2)',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 420,
          margin: '12% auto',
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          padding: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          placeholder="Type a command…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          style={{
            width: '100%',
            padding: 8,
            fontSize: 14,
            border: '1px solid #e5e7eb',
            borderRadius: 6,
          }}
        />

        <div style={{ marginTop: 6, maxHeight: 320, overflow: 'auto' }}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.5,
                  padding: '6px 8px 2px',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </div>
              {items.map((command) => {
                const globalIndex = flat.indexOf(command);
                return (
                  <div
                    key={command.id}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 4,
                      background: globalIndex === index ? '#e0f2fe' : 'transparent',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setIndex(globalIndex)}
                    onClick={() => {
                      command.run(context);
                      onClose();
                    }}
                  >
                    {command.title}
                  </div>
                );
              })}
            </div>
          ))}

          {!flat.length && (
            <div style={{ padding: 8, fontSize: 12, opacity: 0.6 }}>
              No matching commands
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
