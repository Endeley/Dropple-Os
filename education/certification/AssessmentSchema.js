export function createAssessmentItem({
  id,
  type,
  question,
  anchorEventId,
  compareToEventId = null,
  rubric,
}) {
  return {
    id,
    type,
    question,
    anchor: {
      eventId: anchorEventId,
      compareToEventId,
    },
    rubric,
  };
}
