/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `autoRenew` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeSessionId]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentType` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment" DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentType" "PaymentType" NOT NULL,
ADD COLUMN     "stripeSessionId" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'USD';

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "autoRenew",
DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "payment_stripeSessionId_key" ON "payment"("stripeSessionId");
