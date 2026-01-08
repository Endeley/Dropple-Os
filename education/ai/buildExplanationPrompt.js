export function buildExplanationPrompt({
  event,
  changes,
  lessonContext,
}) {
  return `
You are an expert instructor.

Explain what happened in this step of a design lesson.

User action:
${event.type}
${JSON.stringify(event.payload, null, 2)}

Resulting changes:
${JSON.stringify(changes, null, 2)}

Lesson context:
${lessonContext}

Explain clearly and concisely for a beginner.
Avoid jargon.
Explain why this step matters.
`;
}
