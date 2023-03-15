/*
  Warnings:

  - You are about to drop the column `urls` on the `Note2` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "NoteUrl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note2Id" TEXT NOT NULL,
    CONSTRAINT "NoteUrl_note2Id_fkey" FOREIGN KEY ("note2Id") REFERENCES "Note2" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note2" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Note2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Note2" ("createdAt", "id", "userId") SELECT "createdAt", "id", "userId" FROM "Note2";
DROP TABLE "Note2";
ALTER TABLE "new_Note2" RENAME TO "Note2";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
