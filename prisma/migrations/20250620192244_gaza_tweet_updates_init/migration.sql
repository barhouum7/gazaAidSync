/*
  Warnings:

  - Made the column `newsLinkId` on table `aid_points` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "aid_points" ALTER COLUMN "newsLinkId" SET NOT NULL;

-- CreateTable
CREATE TABLE "GazaTweetUser" (
    "id" TEXT NOT NULL,
    "twitterId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "GazaTweetUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GazaTweetHashtag" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "GazaTweetHashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GazaTweetUpdate" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "tweetUrl" TEXT NOT NULL,
    "rawJson" JSONB,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GazaTweetUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TweetHashtags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TweetHashtags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "GazaTweetUser_twitterId_key" ON "GazaTweetUser"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "GazaTweetHashtag_tag_key" ON "GazaTweetHashtag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "GazaTweetUpdate_tweetId_key" ON "GazaTweetUpdate"("tweetId");

-- CreateIndex
CREATE INDEX "_TweetHashtags_B_index" ON "_TweetHashtags"("B");

-- AddForeignKey
ALTER TABLE "GazaTweetUpdate" ADD CONSTRAINT "GazaTweetUpdate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "GazaTweetUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TweetHashtags" ADD CONSTRAINT "_TweetHashtags_A_fkey" FOREIGN KEY ("A") REFERENCES "GazaTweetHashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TweetHashtags" ADD CONSTRAINT "_TweetHashtags_B_fkey" FOREIGN KEY ("B") REFERENCES "GazaTweetUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
