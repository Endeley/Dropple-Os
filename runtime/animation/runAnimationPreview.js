import { evaluateAnimationTimeline } from '@/timeline/evaluateAnimationTimeline.js';
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';
import { getRuntimeState } from '../state/runtimeState.js';

/**
 * Runs animation preview (illusion only).
 *
 * @param {Object} params
 * @param {Object} params.designState
 * @param {number} params.timeMs
 * @param {string=} params.clipId
 *
 * @returns {{ cancel: Function }}
 */
export function runAnimationPreview({ designState, timeMs, clipId }) {
  let cancelled = false;

  const runtime = getRuntimeState();
  if (designState?.__isReplaying || runtime?.__isReplaying) {
    return {
      cancel() {
        cancelled = true;
      },
    };
  }

  function apply() {
    if (cancelled) return;

    const animations = designState?.timeline?.animations;

    if (!animations) return;

    const projection = evaluateAnimationTimeline({
      animations,
      timeMs,
      clipId,
    });

    const animatedNodes = { ...(runtime.nodes || {}) };

    for (const nodeId in projection.nodes) {
      animatedNodes[nodeId] = {
        ...(animatedNodes[nodeId] || {}),
        ...projection.nodes[nodeId],
      };
    }

    useAnimatedRuntimeStore.setState(
      {
        nodes: animatedNodes,
        rootIds: runtime.rootIds,
      },
      false
    );
  }

  apply();

  return {
    cancel() {
      cancelled = true;
      useAnimatedRuntimeStore.setState(
        {
          nodes: {},
          rootIds: [],
        },
        false
      );
    },
  };
}
