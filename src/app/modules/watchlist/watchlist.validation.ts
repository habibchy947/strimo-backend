import { z } from 'zod';

export const createWatchlistSchema = z.object({
  name: z.string("Name must be a string").min(1, "Name cannot be empty").max(50, "Name must be less than 50 characters").optional(),
}).strict();

export const updateWatchlistSchema = z.object({
  name: z.string("Name must be a string").min(1, "Name cannot be empty").max(50, "Name must be less than 50 characters"),
}).strict();

export const addWatchlistItemSchema = z.object({
  mediaId: z.string("Media ID must be a string").min(1, "Media ID is required"),
}).strict();
