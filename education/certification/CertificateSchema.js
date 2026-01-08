export function createCertificate({
  learnerId,
  lessonId,
  score,
  issuedAt = Date.now(),
}) {
  return {
    type: 'dropple.certificate',
    learnerId,
    lessonId,
    score,
    issuedAt,
    verifier: 'Dropple OS',
  };
}
