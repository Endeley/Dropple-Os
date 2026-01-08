export function createLessonListing({
  lessonId,
  title,
  description,
  authorId,
  tags = [],
  difficulty,
  price = 0,
  createdAt = Date.now(),
}) {
  return {
    lessonId,
    title,
    description,
    authorId,
    tags,
    difficulty,
    price,

    stats: {
      enrollments: 0,
      completions: 0,
      certificationsIssued: 0,
    },

    governance: {
      status: 'draft',
      trustLevel: 'unverified',
    },

    createdAt,
  };
}
