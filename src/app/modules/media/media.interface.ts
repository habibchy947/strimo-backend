import { Genre, MediaType, PricingType } from "../../../generated/prisma/enums";

export type ICreateMediaPayload = {
  title: string;
  synopsis: string;
  releaseYear: number;
  director: string;
  duration?: string;
  mediaType: MediaType;
  pricingType: PricingType;
  price?: number;
  rentalPrice?: number;
  rentalDays?: number;
  streamingUrl?: string;
  trailerUrl?: string; // added back as per Option A string URL
  posterUrl?: string;
  screenshots?: string[];
  genres: Genre[];
  cast: string[];
  isFeatured?: boolean;
  isEditorPick?: boolean;
};

export type IUpdateMediaPayload = {
  title?: string;
  synopsis?: string;
  releaseYear?: number;
  director?: string;
  duration?: string;
  mediaType?: MediaType;
  pricingType?: PricingType;
  price?: number;
  rentalPrice?: number;
  rentalDays?: number;
  streamingUrl?: string;
  trailerUrl?: string;
  posterUrl?: string;
  screenshots?: string[];
  isFeatured?: boolean;
  isEditorPick?: boolean;
  genres?: Genre[];
  cast?: string[];
};

export type IMediaFilterQuery = {
  search?: string;
  mediaType?: MediaType;
  pricingType?: PricingType;
  releaseYear?: number;
};
