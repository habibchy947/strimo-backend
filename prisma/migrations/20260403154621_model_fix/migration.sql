/*
  Warnings:

  - You are about to drop the column `bannerUrl` on the `media` table. All the data in the column will be lost.
  - You are about to drop the `cast_member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `media_cast` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "media_cast" DROP CONSTRAINT "media_cast_castMemberId_fkey";

-- DropForeignKey
ALTER TABLE "media_cast" DROP CONSTRAINT "media_cast_mediaId_fkey";

-- AlterTable
ALTER TABLE "media" DROP COLUMN "bannerUrl",
ADD COLUMN     "cast" TEXT[];

-- DropTable
DROP TABLE "cast_member";

-- DropTable
DROP TABLE "media_cast";
