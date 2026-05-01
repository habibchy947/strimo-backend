/*
  Warnings:

  - You are about to drop the column `paymentType` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSessionId` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodEnd` on the `subscription` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'INACTIVE';

-- DropIndex
DROP INDEX "payment_stripeSessionId_key";

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "paymentType",
DROP COLUMN "stripeSessionId",
ADD COLUMN     "paymentMethod" TEXT;

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "currentPeriodEnd",
ADD COLUMN     "autoRenew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
