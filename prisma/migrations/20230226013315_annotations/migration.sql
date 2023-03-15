/*
  Warnings:

  - You are about to drop the column `type` on the `Annotation` table. All the data in the column will be lost.
  - Added the required column `propertyName` to the `Annotation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Annotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyName" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note2Id" TEXT NOT NULL,
    CONSTRAINT "Annotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Annotation_note2Id_fkey" FOREIGN KEY ("note2Id") REFERENCES "Note2" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Annotation" ("id", "note2Id", "userId", "value") SELECT "id", "note2Id", "userId", "value" FROM "Annotation";
DROP TABLE "Annotation";
ALTER TABLE "new_Annotation" RENAME TO "Annotation";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
