'use client';

import { Panel } from '@/ui/Panel';
import SubmissionInfoPanel from '@/review/panels/SubmissionInfoPanel';

export default function LeftPanel({ panels = [], submission }) {
  const panelItems = panels
    .map((p) => {
      if (p === 'SubmissionInfoPanel' && !submission) return null;
      return p;
    })
    .filter(Boolean);

  const isRelevant = panelItems.length > 0;

  return (
    <aside
      className="left-panel"
      aria-hidden={!isRelevant}
      style={{
        transition: 'opacity 120ms ease, transform 120ms ease',
        opacity: isRelevant ? 1 : 0,
        transform: isRelevant ? 'translateX(0)' : 'translateX(-8px)',
        pointerEvents: isRelevant ? 'auto' : 'none',
      }}
    >
      {panelItems.map((p) => {
        if (p === 'SubmissionInfoPanel') {
          return (
            <Panel key={p} title="Submission">
              <SubmissionInfoPanel submission={submission} />
            </Panel>
          );
        }

        return null;
      })}
    </aside>
  );
}
