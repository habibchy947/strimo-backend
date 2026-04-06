-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "status" "CommentStatus" NOT NULL DEFAULT 'APPROVED';
