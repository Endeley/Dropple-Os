export function isCertified(result, rubric) {
  const max = rubric.criteria.reduce((s, c) => s + c.maxScore, 0);
  return result.totalScore >= max * 0.75;
}
