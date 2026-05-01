/*
  Warnings:

  - You are about to drop the column `provider` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment" DROP COLUMN "provider";

-- DropEnum
DROP TYPE "PaymentProvider";
