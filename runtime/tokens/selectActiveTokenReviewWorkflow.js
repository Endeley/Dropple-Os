import { projectTokenReviewWorkflow } from '@/runtime/tokens/projectTokenReviewWorkflow.js';

export function selectActiveTokenReviewWorkflow(state, options = {}) {
    return projectTokenReviewWorkflow(state?.document?.tokenReviews, options);
}
