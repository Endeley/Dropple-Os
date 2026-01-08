import { computeStateDiff } from './computeStateDiff.js';
import { buildExplanationPrompt } from './buildExplanationPrompt.js';

export class ExplanationAgent {
  constructor({ llm, annotationStore }) {
    this.llm = llm;
    this.store = annotationStore;
  }

  async observeStep({
    event,
    prevState,
    nextState,
    lessonContext,
  }) {
    const changes = computeStateDiff(prevState, nextState);
    if (!changes.length) return;

    const prompt = buildExplanationPrompt({
      event,
      changes,
      lessonContext,
    });

    const text = await this.llm.generate(prompt);

    this.store.add({
      id: crypto.randomUUID(),
      eventId: event.id,
      text,
      author: 'ai',
      createdAt: Date.now(),
    });
  }
}
