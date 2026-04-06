import { z } from 'zod';
import { ReviewStatus, ReviewTag } from '../../../generated/prisma/enums';

export const createReviewSchema = z.object({
  rating: z.number('Rating must be a number').min(1, 'Rating must be at least 1.').max(10, 'Rating must be between 1 and 10.'),
  content: z.string('Content must be a string').min(1, 'Content is required.'),
  hasSpoiler: z.boolean().optional(),
  tags: z.array(z.enum(ReviewTag, 'Tag must be CLASSIC, UNDERRATED, MUST_WATCH, FAMILY_FRIENDLY'), 'Tag must be an array of strings').optional(),
  mediaId: z.string().min(1, 'Media ID is required to post a review.'),
})


export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(10).optional(),
  content: z.string().optional(),
  hasSpoiler: z.boolean().optional(),
  tags: z.array(z.enum(ReviewTag, 'Tag must be CLASSIC, UNDERRATED, MUST_WATCH, FAMILY_FRIENDLY'), 'Tag must be an array of strings').optional(),
});

export const changeReviewStatusSchema = z.object({
  status: z.enum(ReviewStatus, 'Status must be PENDING, APPROVED, or REJECTED.'),
});

