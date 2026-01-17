import { v } from 'convex/values';
import { assertOwnershipInvariant } from './assertOwnershipInvariant';

export async function getUserRole(ctx, docId) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  await assertOwnershipInvariant(ctx, docId);

  const membership = await ctx.db
    .query('documentMembers')
    .withIndex('by_doc_user', (q) =>
      q.eq('docId', docId).eq('userId', identity.subject)
    )
    .unique();

  return membership?.role ?? null;
}

export const DocumentRoleValidator = v.union(
  v.literal('owner'),
  v.literal('editor'),
  v.literal('viewer')
);
