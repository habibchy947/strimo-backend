import { z } from 'zod';
import { Genre, MediaType, PricingType } from '../../../generated/prisma/enums';


export const createMediaSchema = z.object({
  title: z.string('Title must be a string').min(1, 'Title is required'),
  synopsis: z.string('Synopsis must be a string').min(1, 'Synopsis is required'),
  releaseYear: z.preprocess(
    (val) => Number(val),
    z.number('Release year must be a valid number')
  ),
  director: z.string('Director must be a string').min(1, 'Director is required'),
  duration: z.string().optional(),
  mediaType: z.enum([MediaType.MOVIE, MediaType.SERIES], 'MediaType must be either Movie or Series'),
  pricingType: z.enum([PricingType.FREE, PricingType.PREMIUM], 'PricingType must be either Free or Premium').default('FREE'),
  price: z.preprocess((val) => Number(val) || 0, z.number().optional()),
  rentalPrice: z.preprocess((val) => Number(val) || 0, z.number().optional()),
  rentalDays: z.preprocess((val) => Number(val) || 7, z.number().optional()),
  streamingUrl: z.url("Streaming URL must be a valid URL").optional(),
  trailerUrl: z.url("Trailer URL must be a valid URL").optional(),
  isFeatured: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  isEditorPick: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  genres: z.array(z.enum([Genre.ACTION, Genre.COMEDY, Genre.DRAMA, Genre.HORROR, Genre.ROMANCE, Genre.SCI_FI, Genre.THRILLER, Genre.FANTASY, Genre.MYSTERY, Genre.ADVENTURE, Genre.ANIMATION, Genre.BIOGRAPHY, Genre.CRIME, Genre.DOCUMENTARY, Genre.FAMILY, Genre.HISTORY, Genre.MUSIC, Genre.SPORT, Genre.WESTERN, Genre.WAR], 'Genre must be a valid genre'), 'Genres are required').min(
    1,
    'At least one genre is required'
  ),
  cast: z.array(z.string('Cast must be a string'), 'Cast is required').min(
    1,
    'At least one cast member is required'
  )
}).strict();

export const updateMediaSchema = z.object({
  title: z.string('Title must be a string').min(1, 'Title is required').optional(),
  synopsis: z.string('Synopsis must be a string').min(1, 'Synopsis is required').optional(),
  releaseYear: z.preprocess(
    (val) => Number(val),
    z.number('Release year must be a valid number')
  ).optional(),
  director: z.string('Director must be a string').min(1, 'Director is required').optional(),
  duration: z.string().optional(),
  mediaType: z.enum([MediaType.MOVIE, MediaType.SERIES], 'MediaType must be either Movie or Series').optional(),
  pricingType: z.enum([PricingType.FREE, PricingType.PREMIUM], 'PricingType must be either Free or Premium').default('FREE').optional(),
  price: z.preprocess((val) => Number(val) || 0, z.number().optional()),
  rentalPrice: z.preprocess((val) => Number(val) || 0, z.number().optional()),
  rentalDays: z.preprocess((val) => Number(val) || 7, z.number().optional()),
  streamingUrl: z.url("Streaming URL must be a valid URL").optional(),
  trailerUrl: z.url("Trailer URL must be a valid URL").optional(),
  isFeatured: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  isEditorPick: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  genres: z.array(z.enum([Genre.ACTION, Genre.COMEDY, Genre.DRAMA, Genre.HORROR, Genre.ROMANCE, Genre.SCI_FI, Genre.THRILLER, Genre.FANTASY, Genre.MYSTERY, Genre.ADVENTURE, Genre.ANIMATION, Genre.BIOGRAPHY, Genre.CRIME, Genre.DOCUMENTARY, Genre.FAMILY, Genre.HISTORY, Genre.MUSIC, Genre.SPORT, Genre.WESTERN, Genre.WAR], 'Genre must be a valid genre'), 'Genres are required').min(
    1,
    'At least one genre is required'
  ).optional(),
  cast: z.array(z.string('Cast must be a string'), 'Cast is required').min(
    1,
    'At least one cast member is required'
  ).optional(),
}).strict();
