/*
  Warnings:

  - You are about to drop the column `unavailableVotes` on the `Note2` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note2" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" TEXT NOT NULL DEFAULT '',
    "isUnavailableCounter" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Note2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Note2" ("comments", "createdAt", "id", "userId") SELECT "comments", "createdAt", "id", "userId" FROM "Note2";
DROP TABLE "Note2";
ALTER TABLE "new_Note2" RENAME TO "Note2";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
