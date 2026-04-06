import { z } from 'zod';
import { UserStatus } from '../../../generated/prisma/enums';

export const updateUserProfileSchema = z.object({
  name: z.string("Name must be a string").min(1, "Name cannot be empty").max(50, "Name must be less than 50 characters").optional(),
}).strict();

export const changeUserStatusSchema = z.object({
  status: z.enum(UserStatus, "Status must be one of: " + Object.values(UserStatus).join(", ")),
});
