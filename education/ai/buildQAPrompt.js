export function buildQAPrompt({
  question,
  evidence,
}) {
  return `
You are an expert instructor answering a student question.

You MUST:
- Use only the provided evidence
- Reference the actual design actions
- Avoid speculation
- Say "This cannot be determined" if unclear

Lesson context:
${JSON.stringify(evidence.lessonMeta, null, 2)}

Design step:
${JSON.stringify(evidence.event, null, 2)}

Previous step:
${JSON.stringify(evidence.previousEvent, null, 2)}

Annotations:
${JSON.stringify(evidence.annotations, null, 2)}

Student question:
"${question}"

Answer clearly and concisely.
Explain why, not just what.
`;
}
