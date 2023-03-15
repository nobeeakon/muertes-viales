/*
  Warnings:

  - Added the required column `url` to the `NoteUrl` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NoteUrl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "note2Id" TEXT NOT NULL,
    CONSTRAINT "NoteUrl_note2Id_fkey" FOREIGN KEY ("note2Id") REFERENCES "Note2" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NoteUrl" ("id", "note2Id") SELECT "id", "note2Id" FROM "NoteUrl";
DROP TABLE "NoteUrl";
ALTER TABLE "new_NoteUrl" RENAME TO "NoteUrl";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
