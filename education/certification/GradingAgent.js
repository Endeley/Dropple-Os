import { buildEvidenceContext } from '../ai/buildEvidenceContext.js';

export class GradingAgent {
  constructor({ llm }) {
    this.llm = llm;
  }

  async grade({ submission, assessment, lesson }) {
    const evidence = buildEvidenceContext({
      lesson,
      eventId: assessment.anchor.eventId,
      compareToId: assessment.anchor.compareToEventId,
    });

    const prompt = `
You are grading a learner's explanation.

Use ONLY the provided evidence.
Score strictly using the rubric.
Explain scoring per criterion.

Rubric:
${JSON.stringify(assessment.rubric, null, 2)}

Evidence:
${JSON.stringify(evidence, null, 2)}

Learner answer:
"${submission.answerText}"

Return JSON with scores per criterion and total score.
`;

    return JSON.parse(await this.llm.generate(prompt));
  }
}
