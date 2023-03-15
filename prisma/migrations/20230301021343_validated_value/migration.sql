/*
  Warnings:

  - Added the required column `value` to the `ValidatedAnnotation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ValidatedAnnotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyName" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "note2Id" TEXT NOT NULL,
    CONSTRAINT "ValidatedAnnotation_note2Id_fkey" FOREIGN KEY ("note2Id") REFERENCES "Note2" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ValidatedAnnotation" ("id", "note2Id", "propertyName") SELECT "id", "note2Id", "propertyName" FROM "ValidatedAnnotation";
DROP TABLE "ValidatedAnnotation";
ALTER TABLE "new_ValidatedAnnotation" RENAME TO "ValidatedAnnotation";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
