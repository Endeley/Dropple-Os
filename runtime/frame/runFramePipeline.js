import { collectInput } from './stages/collectInput.js';
import { processDispatcherQueue } from './stages/processDispatcherQueue.js';
import { evaluateTimeline } from './stages/evaluateTimeline.js';
import { buildRenderGraph } from './stages/buildRenderGraph.js';
import { applySessionPreview } from './stages/applySessionPreview.js';
import { applyPreviewTransforms } from './stages/applyPreviewTransforms.js';
import { computeGuidesStage } from './stages/computeGuides.js';
import { computeLayoutInferenceStage } from './stages/computeLayoutInference.js';
import { applyViewportTransform } from './stages/applyViewportTransform.js';
import { buildSelectionOverlay } from './stages/buildSelectionOverlay.js';

import { evaluateGraphs } from '@/runtime/animation/graph/graphRuntime.js';

// ✅ PURE + ISOLATED + DETERMINISTIC
function applyAnimationGraphStage(context) {
    const { runtimeState, time } = context;

    const snapshot = {
        document: runtimeState?.document ?? {},
        runtime: runtimeState,
    };

    // ✅ STRICT CONTEXT CONTRACT (VERY IMPORTANT)
    const graphContext = {
        time,
        parameters: context?.parameters ?? null,
        // future-safe hooks (explicit only)
        scene: runtimeState?.scene ?? null,
    };

    const layers = evaluateGraphs(snapshot, graphContext);

    return {
        ...context,
        animation: {
            ...(context.animation ?? {}),
            layers,
        },
    };
}

export function runFramePipeline(context) {
    context = collectInput(context);
    context = processDispatcherQueue(context);

    context = evaluateTimeline(context);

    // ✅ correct placement
    context = applyAnimationGraphStage(context);

    context = buildRenderGraph(context);

    context = applySessionPreview(context);
    context = applyPreviewTransforms(context);
    context = computeGuidesStage(context);
    context = computeLayoutInferenceStage(context);
    context = applyViewportTransform(context);
    context = buildSelectionOverlay(context);

    return context;
}

export function runFrame(runtimeState, time = 0, input = {}) {
    const context = {
        runtimeState,
        time,
        input,
    };

    return runFramePipeline(context);
}
