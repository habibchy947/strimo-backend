/*
  Warnings:

  - The `tags` column on the `review` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReviewTag" AS ENUM ('CLASSIC', 'UNDERRATED', 'MUST_WATCH', 'FAMILY_FRIENDLY');

-- AlterTable
ALTER TABLE "review" DROP COLUMN "tags",
ADD COLUMN     "tags" "ReviewTag"[];
