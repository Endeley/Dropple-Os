/**
 * @typedef {Object} Submission
 * @property {string} id
 * @property {string} assessmentId
 * @property {string} userId
 * @property {string} workspaceId
 * @property {Array} events
 * @property {import('../rubrics/rubricTypes.js').Rubric | undefined} rubric
 * @property {string} replayHash
 * @property {number} submittedAt
 * @property {'pending' | 'passed' | 'failed' | 'revision'} status
 * @property {{ criteria: Record<string, boolean> }} review
 */

export {};
