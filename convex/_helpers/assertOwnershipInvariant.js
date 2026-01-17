export async function assertOwnershipInvariant(ctx, docId) {
  if (process.env.NODE_ENV !== 'development') return;

  const owners = await ctx.db
    .query('documentMembers')
    .withIndex('by_doc', (q) => q.eq('docId', docId))
    .filter((q) => q.eq(q.field('role'), 'owner'))
    .collect();

  if (owners.length !== 1) {
    console.warn(
      `[Invariant violation] doc ${docId} has ${owners.length} owners`
    );
  }
}
