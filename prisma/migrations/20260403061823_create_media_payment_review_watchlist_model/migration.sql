-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('MOVIE', 'SERIES');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('ACTION', 'ADVENTURE', 'ANIMATION', 'COMEDY', 'CRIME', 'DOCUMENTARY', 'DRAMA', 'FAMILY', 'FANTASY', 'HISTORY', 'HORROR', 'MUSIC', 'MYSTERY', 'ROMANCE', 'SCI_FI', 'THRILLER', 'WAR', 'WESTERN', 'BIOGRAPHY', 'SPORT');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'SSLCOMMERZ', 'RAZORPAY', 'PAYPAL');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('BUY', 'RENT');

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "posterUrl" TEXT,
    "bannerUrl" TEXT,
    "trailerUrl" TEXT,
    "releaseYear" INTEGER NOT NULL,
    "director" TEXT NOT NULL,
    "duration" TEXT,
    "mediaType" "MediaType" NOT NULL,
    "pricingType" "PricingType" NOT NULL DEFAULT 'FREE',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rentalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rentalDays" INTEGER NOT NULL DEFAULT 7,
    "streamingUrl" TEXT,
    "genres" "Genre"[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isEditorPick" BOOLEAN NOT NULL DEFAULT false,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cast_member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cast_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_cast" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "castMemberId" TEXT NOT NULL,

    CONSTRAINT "media_cast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaming_platform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaming_platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_platform" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "media_platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "PaymentProvider" NOT NULL,
    "transactionId" TEXT,
    "paymentMethod" TEXT,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "purchaseId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase" (
    "id" TEXT NOT NULL,
    "purchaseType" "PurchaseType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "rentalExpiry" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "hasSpoiler" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "parentId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Watchlist',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist_item" (
    "id" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_slug_key" ON "media"("slug");

-- CreateIndex
CREATE INDEX "media_mediaType_idx" ON "media"("mediaType");

-- CreateIndex
CREATE INDEX "media_releaseYear_idx" ON "media"("releaseYear");

-- CreateIndex
CREATE INDEX "media_averageRating_idx" ON "media"("averageRating");

-- CreateIndex
CREATE INDEX "media_pricingType_idx" ON "media"("pricingType");

-- CreateIndex
CREATE INDEX "media_isPublished_isDeleted_idx" ON "media"("isPublished", "isDeleted");

-- CreateIndex
CREATE INDEX "media_cast_mediaId_idx" ON "media_cast"("mediaId");

-- CreateIndex
CREATE INDEX "media_cast_castMemberId_idx" ON "media_cast"("castMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "media_cast_mediaId_castMemberId_role_key" ON "media_cast"("mediaId", "castMemberId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "streaming_platform_name_key" ON "streaming_platform"("name");

-- CreateIndex
CREATE INDEX "media_platform_mediaId_idx" ON "media_platform"("mediaId");

-- CreateIndex
CREATE INDEX "media_platform_platformId_idx" ON "media_platform"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "media_platform_mediaId_platformId_key" ON "media_platform"("mediaId", "platformId");

-- CreateIndex
CREATE INDEX "subscription_userId_idx" ON "subscription"("userId");

-- CreateIndex
CREATE INDEX "subscription_status_idx" ON "subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactionId_key" ON "payment"("transactionId");

-- CreateIndex
CREATE INDEX "payment_userId_idx" ON "payment"("userId");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "payment"("status");

-- CreateIndex
CREATE INDEX "payment_subscriptionId_idx" ON "payment"("subscriptionId");

-- CreateIndex
CREATE INDEX "payment_purchaseId_idx" ON "payment"("purchaseId");

-- CreateIndex
CREATE INDEX "purchase_userId_idx" ON "purchase"("userId");

-- CreateIndex
CREATE INDEX "purchase_mediaId_idx" ON "purchase"("mediaId");

-- CreateIndex
CREATE INDEX "purchase_userId_mediaId_idx" ON "purchase"("userId", "mediaId");

-- CreateIndex
CREATE INDEX "review_mediaId_idx" ON "review"("mediaId");

-- CreateIndex
CREATE INDEX "review_userId_idx" ON "review"("userId");

-- CreateIndex
CREATE INDEX "review_status_idx" ON "review"("status");

-- CreateIndex
CREATE INDEX "review_rating_idx" ON "review"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "review_userId_mediaId_key" ON "review"("userId", "mediaId");

-- CreateIndex
CREATE INDEX "review_like_reviewId_idx" ON "review_like"("reviewId");

-- CreateIndex
CREATE INDEX "review_like_userId_idx" ON "review_like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "review_like_userId_reviewId_key" ON "review_like"("userId", "reviewId");

-- CreateIndex
CREATE INDEX "comment_reviewId_idx" ON "comment"("reviewId");

-- CreateIndex
CREATE INDEX "comment_userId_idx" ON "comment"("userId");

-- CreateIndex
CREATE INDEX "comment_parentId_idx" ON "comment"("parentId");

-- CreateIndex
CREATE INDEX "watchlist_userId_idx" ON "watchlist"("userId");

-- CreateIndex
CREATE INDEX "watchlist_item_watchlistId_idx" ON "watchlist_item"("watchlistId");

-- CreateIndex
CREATE INDEX "watchlist_item_mediaId_idx" ON "watchlist_item"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_item_watchlistId_mediaId_key" ON "watchlist_item"("watchlistId", "mediaId");

-- AddForeignKey
ALTER TABLE "media_cast" ADD CONSTRAINT "media_cast_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_cast" ADD CONSTRAINT "media_cast_castMemberId_fkey" FOREIGN KEY ("castMemberId") REFERENCES "cast_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_platform" ADD CONSTRAINT "media_platform_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_platform" ADD CONSTRAINT "media_platform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "streaming_platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_item" ADD CONSTRAINT "watchlist_item_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_item" ADD CONSTRAINT "watchlist_item_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
