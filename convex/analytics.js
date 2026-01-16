import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const trackView = mutation({
  args: {
    galleryItemId: v.id('galleryItems'),
    ownerId: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    await ctx.db.insert('analyticsEvents', {
      type: 'view',
      galleryItemId: args.galleryItemId,
      ownerId: args.ownerId,
      actorId: identity?.subject ?? null,
      source: args.source ?? null,
      createdAt: Date.now(),
    });
  },
});

export const trackFork = mutation({
  args: {
    galleryItemId: v.id('galleryItems'),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    await ctx.db.insert('analyticsEvents', {
      type: 'fork',
      galleryItemId: args.galleryItemId,
      ownerId: args.ownerId,
      actorId: identity?.subject ?? null,
      source: 'viewer',
      createdAt: Date.now(),
    });
  },
});

export const getGalleryStats = query({
  args: {
    galleryItemId: v.id('galleryItems'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const item = await ctx.db.get(args.galleryItemId);
    if (!item) {
      return null;
    }

    if (item.ownerId !== identity.subject) {
      throw new Error('Forbidden');
    }

    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_gallery', (q) =>
        q.eq('galleryItemId', args.galleryItemId)
      )
      .collect();

    let views = 0;
    let forks = 0;
    let publishes = 0;

    for (const event of events) {
      if (event.type === 'view') views += 1;
      else if (event.type === 'fork') forks += 1;
      else if (event.type === 'publish') publishes += 1;
    }

    return { views, forks, publishes };
  },
});
