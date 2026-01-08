import { buildEvidenceContext } from './buildEvidenceContext.js';
import { buildQAPrompt } from './buildQAPrompt.js';

export class QAAgent {
  constructor({ llm }) {
    this.llm = llm;
  }

  async answer({ question, lesson, anchor }) {
    const evidence = buildEvidenceContext({
      lesson,
      eventId: anchor.eventId,
      compareToId: anchor.compareToId,
    });

    const prompt = buildQAPrompt({
      question,
      evidence,
    });

    return await this.llm.generate(prompt);
  }
}
