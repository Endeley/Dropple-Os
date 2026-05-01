import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { normalizeArtifact } from '@/gallery/artifacts/normalizeArtifact.js';

const snapshotArtifactValidator = v.object({
  kind: v.literal('snapshot'),
  snapshot: v.any(),
});

const environmentArtifactValidator = v.object({
  kind: v.literal('environment'),
  snapshot: v.any(),
  descriptor: v.any(),
  resolvedEnvironment: v.any(),
});

async function insertGalleryDocumentAndItem(ctx, {
  ownerId,
  artifact,
  title,
  description,
  tags,
  mode,
  thumbnailStorageId,
  source = 'editor',
}) {
  const now = Date.now();
  const documentId = await ctx.db.insert('galleryDocuments', {
    ownerId,
    artifact,
    createdAt: now,
    updatedAt: now,
  });

  const galleryId = await ctx.db.insert('galleryItems', {
    ownerId,
    documentId,
    title,
    description: description ?? '',
    thumbnailStorageId: thumbnailStorageId ?? undefined,
    tags: tags ?? [],
    mode: mode ?? null,
    createdAt: now,
  });

  await ctx.db.insert('analyticsEvents', {
    type: 'publish',
    galleryItemId: galleryId,
    documentId,
    ownerId,
    actorId: ownerId,
    source,
    createdAt: now,
  });

  return { galleryId, documentId };
}

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
    artifact: v.union(snapshotArtifactValidator, environmentArtifactValidator),
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

    const artifact = normalizeArtifact(args.artifact, {
      source: 'gallery publish',
    });

    return await insertGalleryDocumentAndItem(ctx, {
      ownerId: identity.subject,
      artifact,
      title: args.title,
      description: args.description ?? '',
      tags: args.tags ?? [],
      mode: args.mode ?? null,
      thumbnailStorageId: args.thumbnailStorageId ?? undefined,
      source: 'editor',
    });
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
      artifact: normalizeArtifact(document.artifact ?? document, {
        source: 'gallery document',
      }),
    };
  },
});
