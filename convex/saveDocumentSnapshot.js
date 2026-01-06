// convex/saveDocumentSnapshot.js

import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Persist a full document snapshot.
 *
 * 🔒 Rules:
 * - Explicit save only
 * - Idempotent by eventId
 * - No runtime state assumptions
 */
export const saveDocumentSnapshot = mutation({
    args: {
        docId: v.string(),
        currentBranch: v.string(),

        branches: v.array(
            v.object({
                branchId: v.string(),
                base: v.optional(v.string()),
                events: v.array(
                    v.object({
                        eventId: v.string(),
                        type: v.string(),
                        payload: v.any(),
                        createdAt: v.number(),
                    })
                ),
            })
        ),

        timelines: v.optional(v.any()),
        markers: v.optional(
            v.array(
                v.object({
                    markerId: v.string(),
                    time: v.number(),
                    label: v.string(),
                    createdAt: v.number(),
                })
            )
        ),
    },

    async handler(ctx, args) {
        const now = Date.now();

        // 1️⃣ Upsert document
        const existingDoc = await ctx.db
            .query('documents')
            .withIndex('by_docId', (q) => q.eq('docId', args.docId))
            .unique();

        if (existingDoc) {
            await ctx.db.patch(existingDoc._id, {
                currentBranch: args.currentBranch,
                updatedAt: now,
            });
        } else {
            await ctx.db.insert('documents', {
                docId: args.docId,
                currentBranch: args.currentBranch,
                createdAt: now,
                updatedAt: now,
            });
        }

        // 2️⃣ Upsert branches + events
        for (const branch of args.branches) {
            const existingBranch = await ctx.db
                .query('branches')
                .withIndex('by_doc_branch', (q) => q.eq('docId', args.docId).eq('branchId', branch.branchId))
                .unique();

            if (!existingBranch) {
                await ctx.db.insert('branches', {
                    docId: args.docId,
                    branchId: branch.branchId,
                    base: branch.base ?? null,
                    createdAt: now,
                });
            }

            // Insert events (idempotent by eventId)
            for (const evt of branch.events) {
                const existingEvent = await ctx.db
                    .query('events')
                    .withIndex('by_eventId', (q) => q.eq('eventId', evt.eventId))
                    .unique();

                if (!existingEvent) {
                    await ctx.db.insert('events', {
                        docId: args.docId,
                        branchId: branch.branchId,
                        eventId: evt.eventId,
                        type: evt.type,
                        payload: evt.payload,
                        createdAt: evt.createdAt,
                    });
                }
            }
        }

        // 3️⃣ Timelines (replace-by-doc)
        if (args.timelines) {
            const existing = await ctx.db.query('timelines').withIndex('by_doc', (q) => q.eq('docId', args.docId)).collect();

            for (const row of existing) {
                await ctx.db.delete(row._id);
            }

            await ctx.db.insert('timelines', {
                docId: args.docId,
                timelineId: 'default',
                data: args.timelines,
                updatedAt: now,
            });
        }

        // 4️⃣ Markers (replace-by-doc)
        if (args.markers) {
            const existing = await ctx.db.query('markers').withIndex('by_doc', (q) => q.eq('docId', args.docId)).collect();

            for (const row of existing) {
                await ctx.db.delete(row._id);
            }

            for (const m of args.markers) {
                await ctx.db.insert('markers', {
                    docId: args.docId,
                    markerId: m.markerId,
                    time: m.time,
                    label: m.label,
                    createdAt: m.createdAt,
                });
            }
        }

        return { ok: true };
    },
});
