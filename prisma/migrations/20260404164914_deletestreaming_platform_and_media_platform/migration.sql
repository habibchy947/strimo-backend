/*
  Warnings:

  - You are about to drop the `media_platform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `streaming_platform` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "media_platform" DROP CONSTRAINT "media_platform_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "media_platform" DROP CONSTRAINT "media_platform_platformId_fkey";

-- DropTable
DROP TABLE "media_platform";

-- DropTable
DROP TABLE "streaming_platform";
