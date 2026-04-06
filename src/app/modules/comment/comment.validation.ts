import { z } from 'zod';
import { CommentStatus } from '../../../generated/prisma/enums';

export const createCommentSchema = z.object({
  content: z.string('Content must be a string').min(1, 'Content is required.'),
  parentId: z.string('Parent ID must be a string').optional(),
});

export const updateCommentSchema = z.object({
  content: z.string('Content must be a string').min(1, 'Content is required.'),
});

export const changeCommentStatusSchema = z.object({
  status: z.enum([CommentStatus.APPROVED, CommentStatus.REJECTED], {message: 'Status must be APPROVED or REJECTED'}),
});
