export function createSubmission({
  assessmentId,
  learnerId,
  answerText,
  submittedAt = Date.now(),
}) {
  return {
    assessmentId,
    learnerId,
    answerText,
    submittedAt,
  };
}
