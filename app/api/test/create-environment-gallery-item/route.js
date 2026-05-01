import { NextResponse } from 'next/server';
import { createEnvironmentBackedGalleryFixture } from '../_galleryFixtures.js';

export async function POST() {
  try {
    const result = await createEnvironmentBackedGalleryFixture();
    return NextResponse.json({
      galleryId: result.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Environment gallery fixture creation failed.',
      },
      { status: 400 },
    );
  }
}
