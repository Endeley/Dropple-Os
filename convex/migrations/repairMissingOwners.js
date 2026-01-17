import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const repairMissingOwners = mutation({
  args: {
    ownerField: v.string(),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db.query('documents').collect();
    let repaired = 0;

    for (const doc of documents) {
      const owners = await ctx.db
        .query('documentMembers')
        .withIndex('by_doc', (q) => q.eq('docId', doc.docId))
        .filter((q) => q.eq(q.field('role'), 'owner'))
        .collect();

      if (owners.length > 1) {
        throw new Error(
          `Migration halted: multiple owners for doc ${doc.docId}`
        );
      }

      if (owners.length === 1) {
        continue;
      }

      const ownerId = doc[args.ownerField];
      if (!ownerId) {
        throw new Error(
          `Migration halted: missing ${args.ownerField} for doc ${doc.docId}`
        );
      }

      await ctx.db.insert('documentMembers', {
        docId: doc.docId,
        userId: ownerId,
        role: 'owner',
        createdAt: doc.createdAt ?? Date.now(),
      });

      repaired += 1;
    }

    return { repaired };
  },
});
