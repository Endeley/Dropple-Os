import { Panel } from '@/ui/Panel';
import { colors } from '@/ui/tokens';

export default function LeftPanel({ panels = [] }) {
  return (
    <aside className="left-panel">
      {panels?.map((p) => (
        <Panel key={p} title={p}>
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            {p} content
          </div>
        </Panel>
      ))}
    </aside>
  );
}
