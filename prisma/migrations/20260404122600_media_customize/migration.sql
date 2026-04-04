/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `media` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "media_title_key" ON "media"("title");
