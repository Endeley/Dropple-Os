/**
 * Cancels any active animation preview.
 *
 * Rules:
 * - Clears animated runtime store
 * - Safe to call multiple times
 */
import { useAnimatedRuntimeStore } from '../stores/useAnimatedRuntimeStore.js';

export function cancelAnimationPreview() {
  useAnimatedRuntimeStore.setState(
    {
      previewNodes: {},
      cameraTransform: null,
    },
    false
  );
}
