'use client';

import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { useDispatcher } from '@/ui/workspace/root/DispatcherProvider/DispatcherContext.jsx';
import { EventTypes } from '@/core/events/eventTypes.js';

export default function ShotTimelineBar() {
  const dispatcher = useDispatcher();
  const sceneGraph = useRuntimeStore((s) => s.sceneGraph);
  const runtimeScene = useRuntimeStore((s) => s.scene);

  if (!sceneGraph || !runtimeScene?.activeSceneId) return null;

  const activeScene = sceneGraph.scenes?.find(
    (scene) => scene.id === runtimeScene.activeSceneId
  );
  const shots = activeScene?.shots ?? [];
  if (!shots.length) return null;

  const totalDuration = Number.isFinite(activeScene?.duration)
    ? Math.max(1, activeScene.duration)
    : Math.max(
        1,
        shots.reduce(
          (max, shot) =>
            Math.max(max, (shot?.start ?? 0) + (shot?.duration ?? 0)),
          0
        )
      );

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: '6px 8px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f8fafc',
        overflowX: 'auto',
      }}
    >
      {shots.map((shot) => {
        const duration = Number.isFinite(shot?.duration) ? shot.duration : 0;
        const widthPct = Math.max(2, (duration / totalDuration) * 100);
        const isActive = shot?.id === runtimeScene.activeShotId;
        return (
          <div
            key={shot.id}
            onClick={() => {
              if (!shot?.id) return;
              dispatcher.dispatch({
                type: EventTypes.SHOT_SET_ACTIVE,
                payload: { shotId: shot.id },
              });
            }}
            style={{
              flex: `0 0 ${widthPct}%`,
              minWidth: 48,
              padding: '6px 8px',
              borderRadius: 6,
              border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: isActive ? 'rgba(37,99,235,0.12)' : '#ffffff',
              color: isActive ? '#1d4ed8' : '#0f172a',
              fontSize: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={shot?.name ?? shot?.id}
          >
            {shot?.name ?? shot?.id}
          </div>
        );
      })}
    </div>
  );
}
