import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { logAudit } from './lib/audit';

const decisionValidator = v.union(v.literal('approved'), v.literal('rejected'));

async function getReviewerRole(ctx, userId) {
  if (!userId) return null;

  const reviewer = await ctx.db
    .query('reviewers')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .unique();

  return reviewer?.role ?? null;
}

export const getReviewPermission = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { canReview: false, role: null, userId: null };

    const role = await getReviewerRole(ctx, identity.subject);
    return { canReview: Boolean(role), role, userId: identity.subject };
  },
});

export const listForReview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const role = await getReviewerRole(ctx, identity.subject);
    if (!role) return [];

    const submitted = await ctx.db
      .query('assessments')
      .withIndex('by_status', (q) => q.eq('status', 'submitted'))
      .order('desc')
      .collect();

    const inReview = await ctx.db
      .query('assessments')
      .withIndex('by_status', (q) => q.eq('status', 'under_review'))
      .order('desc')
      .collect();

    return [...submitted, ...inReview];
  },
});

export const getById = query({
  args: { assessmentId: v.id('assessments') },
  handler: async (ctx, { assessmentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const role = await getReviewerRole(ctx, identity.subject);
    if (!role) return null;

    return await ctx.db.get(assessmentId);
  },
});

export const startReview = mutation({
  args: { assessmentId: v.id('assessments') },
  handler: async (ctx, { assessmentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const role = await getReviewerRole(ctx, identity.subject);
    if (!role) throw new Error('Unauthorized');

    const assessment = await ctx.db.get(assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    if (assessment.submittedBy === identity.subject) {
      throw new Error('Submitter cannot review their own assessment');
    }

    if (assessment.status !== 'submitted') return assessment;

    await ctx.db.patch(assessmentId, {
      status: 'under_review',
    });

    await logAudit(ctx, {
      actorId: identity.subject,
      action: 'assessment.under_review',
      meta: { assessmentId },
    });

    return {
      ...assessment,
      status: 'under_review',
    };
  },
});

export const submitReviewDecision = mutation({
  args: {
    assessmentId: v.id('assessments'),
    decision: decisionValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { assessmentId, decision, notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const role = await getReviewerRole(ctx, identity.subject);
    if (!role) throw new Error('Unauthorized');

    const assessment = await ctx.db.get(assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    if (assessment.submittedBy === identity.subject) {
      throw new Error('Submitter cannot review their own assessment');
    }

    if (assessment.review) throw new Error('Already reviewed');

    if (decision === 'rejected' && !notes?.trim()) {
      throw new Error('Rejection requires a reason');
    }

    await ctx.db.patch(assessmentId, {
      status: decision,
      review: {
        reviewerId: identity.subject,
        reviewedAt: Date.now(),
        decision,
        notes: notes?.trim() || undefined,
      },
    });

    await logAudit(ctx, {
      actorId: identity.subject,
      action: `assessment.${decision}`,
      meta: { assessmentId },
    });

    return {
      ...assessment,
      status: decision,
      review: {
        reviewerId: identity.subject,
        reviewedAt: Date.now(),
        decision,
        notes: notes?.trim() || undefined,
      },
    };
  },
});
