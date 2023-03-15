-- CreateTable
CREATE TABLE "ValidatedAnnotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyName" TEXT NOT NULL,
    "note2Id" TEXT NOT NULL,
    CONSTRAINT "ValidatedAnnotation_note2Id_fkey" FOREIGN KEY ("note2Id") REFERENCES "Note2" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
