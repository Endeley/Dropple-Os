import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { nanoid } from 'nanoid';

export const issueCertificate = mutation({
  args: {
    assessmentId: v.id('assessments'),
  },
  handler: async (ctx, { assessmentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const reviewer = await ctx.db
      .query('reviewers')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .unique();

    if (!reviewer || reviewer.role !== 'admin') {
      throw new Error('Only admins can issue certificates');
    }

    const assessment = await ctx.db.get(assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    if (assessment.status !== 'approved') {
      throw new Error('Certificate can only be issued for approved assessments');
    }

    if (!assessment.review || assessment.review.decision !== 'approved') {
      throw new Error('Approved review snapshot required');
    }

    const existing = await ctx.db
      .query('certificates')
      .withIndex('by_assessment', (q) => q.eq('assessmentId', assessmentId))
      .unique();

    if (existing) return existing;

    const certificateId = nanoid(16);
    const verificationHash = nanoid(32);

    const cert = {
      certificateId,
      assessmentId,
      issuedTo: assessment.submittedBy,
      issuedBy: identity.subject,
      issuedAt: Date.now(),
      reviewSnapshot: {
        reviewerId: assessment.review.reviewerId,
        reviewedAt: assessment.review.reviewedAt,
        decision: 'approved' as const,
      },
      verificationHash,
    };

    await ctx.db.insert('certificates', cert);

    return cert;
  },
});

export const verifyCertificate = query({
  args: {
    certificateId: v.string(),
  },
  handler: async (ctx, { certificateId }) => {
    const cert = await ctx.db
      .query('certificates')
      .withIndex('by_certificateId', (q) => q.eq('certificateId', certificateId))
      .unique();

    if (!cert) return { valid: false };

    return {
      valid: true,
      issuedAt: cert.issuedAt,
      issuedTo: cert.issuedTo,
      assessmentId: cert.assessmentId,
      issuer: 'Dropple OS',
    };
  },
});
