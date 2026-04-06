import { ReviewTag } from "../../../generated/prisma/enums";

export type IReviewFilterRequest = {
  searchTerm?: string;
  rating?: number;
  hasSpoiler?: boolean;
  status?: string;
  mediaId?: string;
  userId?: string;
};

export interface ICreateReviewPayload {
  rating: number;
  content: string;
  hasSpoiler?: boolean;
  tags: ReviewTag[];
  mediaId: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  content?: string;
  hasSpoiler?: boolean;
  tags?: ReviewTag[];
}

