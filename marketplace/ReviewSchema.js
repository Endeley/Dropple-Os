export function createReview({
  lessonId,
  reviewerId,
  findings,
  recommendation,
  createdAt = Date.now(),
}) {
  return {
    lessonId,
    reviewerId,
    findings,
    recommendation,
    createdAt,
  };
}
