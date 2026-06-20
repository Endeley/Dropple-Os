'use client';

import { useMemo } from 'react';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import {
  attachMotionClipToNode,
  getMotionClipsForNode,
  removeMotionClipsFromNode,
} from '@/ui/motion/motionClipActions.js';

export function MotionPanel({ node }) {
  const dispatcher = useDispatcher();
  const document = useWorkspaceProjectionState((state) => state.document ?? null);
  const clips = useMemo(() => getMotionClipsForNode(document, node?.id ?? null), [document, node?.id]);
  const hasTimelineMotion = clips.length > 0;

  if (!node) return null;

  const motion = node.motion || node.props?.motion || null;

  const rows = motion ? [
    { label: 'Type', value: motion.type },
    { label: 'Duration', value: motion.duration },
    { label: 'Easing', value: motion.easing },
    { label: 'Loop', value: motion.loop },
    { label: 'Autoplay', value: motion.autoplay },
  ] : [];

  return (
    <div className="inspector-group">
      <div className="inspector-row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
        <span className="inspector-subtle">Timeline Clips</span>
        <span>{clips.length}</span>
      </div>

      <div className="inspector-row" style={{ justifyContent: 'flex-start', gap: 8 }}>
        {!hasTimelineMotion ? (
          <button
            type="button"
            className="selection-context-menu__button"
            data-testid="uiux-motion-attach"
            onClick={() => attachMotionClipToNode(dispatcher?.dispatch, node?.id ?? null)}
          >
            Attach Motion
          </button>
        ) : (
          <button
            type="button"
            className="selection-context-menu__button is-danger"
            data-testid="uiux-motion-remove"
            onClick={() => removeMotionClipsFromNode(dispatcher?.dispatch, node?.id ?? null, clips)}
          >
            Remove Motion
          </button>
        )}
      </div>

      {!motion && !hasTimelineMotion ? (
        <div className="inspector-subtle" style={{ fontSize: 12 }}>
          No motion attached.
        </div>
      ) : null}

      {rows.map((row) => (
        <div key={row.label} className="inspector-row" style={{ fontSize: 12 }}>
          <span className="inspector-subtle">{row.label}</span>
          <span>{row.value ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}
