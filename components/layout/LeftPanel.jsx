'use client';

import { Panel } from '@/ui/Panel';
import { colors } from '@/ui/tokens';
import SubmissionInfoPanel from '@/review/panels/SubmissionInfoPanel';

export default function LeftPanel({ panels = [], submission }) {
  return (
    <aside className="left-panel">
      {panels?.map((p) => {
        if (p === 'SubmissionInfoPanel') {
          return (
            <Panel key={p} title="Submission">
              <SubmissionInfoPanel submission={submission} />
            </Panel>
          );
        }

        return (
          <Panel key={p} title={p}>
            <div style={{ fontSize: 13, color: colors.textMuted }}>
              {p} content
            </div>
          </Panel>
        );
      })}
    </aside>
  );
}
