import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getGalleryIdentity = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      id: identity.subject,
      name: identity.name ?? null,
      email: identity.email ?? null,
    };
  },
});

export const generateGalleryUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const publishGalleryItem = mutation({
  args: {
    snapshot: v.any(),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    mode: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const now = Date.now();
    const documentId = await ctx.db.insert('galleryDocuments', {
      ownerId: identity.subject,
      snapshot: args.snapshot,
      createdAt: now,
      updatedAt: now,
    });

    const galleryId = await ctx.db.insert('galleryItems', {
      ownerId: identity.subject,
      documentId,
      title: args.title,
      description: args.description ?? '',
      thumbnailStorageId: args.thumbnailStorageId ?? undefined,
      tags: args.tags ?? [],
      mode: args.mode ?? null,
      createdAt: now,
    });

    await ctx.db.insert('analyticsEvents', {
      type: 'publish',
      galleryItemId: galleryId,
      documentId,
      ownerId: identity.subject,
      actorId: identity.subject,
      source: 'editor',
      createdAt: now,
    });

    return { galleryId, documentId };
  },
});

export const listGalleryItems = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query('galleryItems')
      .withIndex('by_createdAt')
      .order('desc')
      .collect();

    const results = await Promise.all(
      items.map(async (item) => {
        const thumbnailUrl = item.thumbnailStorageId
          ? await ctx.storage.getUrl(item.thumbnailStorageId)
          : null;
        return {
          id: item._id,
          title: item.title,
          description: item.description ?? '',
          tags: item.tags ?? [],
          mode: item.mode ?? null,
          createdAt: item.createdAt,
          thumbnailUrl,
          ownerId: item.ownerId,
          creator: { id: item.ownerId },
        };
      })
    );

    return results;
  },
});

export const getGalleryItemById = query({
  args: {
    galleryItemId: v.id('galleryItems'),
  },
  handler: async (ctx, { galleryItemId }) => {
    const item = await ctx.db.get(galleryItemId);
    if (!item) return null;

    const document = await ctx.db.get(item.documentId);
    if (!document) {
      throw new Error('Gallery document missing');
    }

    const thumbnailUrl = item.thumbnailStorageId
      ? await ctx.storage.getUrl(item.thumbnailStorageId)
      : null;

    return {
      id: item._id,
      title: item.title,
      description: item.description ?? '',
      tags: item.tags ?? [],
      mode: item.mode ?? null,
      createdAt: item.createdAt,
      ownerId: item.ownerId,
      thumbnailUrl,
      snapshot: document.snapshot,
    };
  },
});
