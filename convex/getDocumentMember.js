// convex/getDocumentMember.js

import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get a user's role for a document.
 */
export const getDocumentMember = query({
    args: {
        docId: v.string(),
        userId: v.string(),
    },

    async handler(ctx, { docId, userId }) {
        return await ctx.db
            .query('documentMembers')
            .withIndex('by_doc_user', (q) => q.eq('docId', docId).eq('userId', userId))
            .unique();
    },
});
