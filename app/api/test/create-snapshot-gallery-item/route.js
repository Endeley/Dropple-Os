import { NextResponse } from 'next/server';
import { createSnapshotBackedGalleryFixture } from '../_galleryFixtures.js';

export async function POST() {
  try {
    const result = await createSnapshotBackedGalleryFixture();
    return NextResponse.json({
      galleryId: result.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Snapshot gallery fixture creation failed.',
      },
      { status: 400 },
    );
  }
}
