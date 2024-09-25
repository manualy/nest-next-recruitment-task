/*
  Warnings:

  - You are about to drop the column `campaignId` on the `Creative` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Creative" DROP CONSTRAINT "Creative_campaignId_fkey";

-- AlterTable
ALTER TABLE "Creative" DROP COLUMN "campaignId";

-- CreateTable
CREATE TABLE "_CampaignCreatives" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CampaignCreatives_AB_unique" ON "_CampaignCreatives"("A", "B");

-- CreateIndex
CREATE INDEX "_CampaignCreatives_B_index" ON "_CampaignCreatives"("B");

-- AddForeignKey
ALTER TABLE "_CampaignCreatives" ADD CONSTRAINT "_CampaignCreatives_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignCreatives" ADD CONSTRAINT "_CampaignCreatives_B_fkey" FOREIGN KEY ("B") REFERENCES "Creative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
