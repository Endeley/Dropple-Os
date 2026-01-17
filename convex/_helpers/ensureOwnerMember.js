/**
 * Ensures exactly one owner membership exists for a persisted document.
 * Safe to call multiple times (idempotent).
 *
 * MUST be called whenever a document is first persisted server-side.
 */
export async function ensureOwnerMember(ctx, docId) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Unauthorized');
  }

  const existingOwners = await ctx.db
    .query('documentMembers')
    .withIndex('by_doc', (q) => q.eq('docId', docId))
    .filter((q) => q.eq(q.field('role'), 'owner'))
    .collect();

  if (existingOwners.length === 1) {
    return;
  }

  if (existingOwners.length > 1) {
    throw new Error(`Invariant violation: multiple owners for doc ${docId}`);
  }

  await ctx.db.insert('documentMembers', {
    docId,
    userId: identity.subject,
    role: 'owner',
    createdAt: Date.now(),
  });

  await assertOwnershipInvariant(ctx, docId);
}
import { assertOwnershipInvariant } from './assertOwnershipInvariant';
