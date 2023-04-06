-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note2" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" TEXT NOT NULL DEFAULT '',
    "isUnavailableCounter" INTEGER NOT NULL DEFAULT 0,
    "invalidCounter" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Note2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Note2" ("comments", "createdAt", "id", "isUnavailableCounter", "userId") SELECT "comments", "createdAt", "id", "isUnavailableCounter", "userId" FROM "Note2";
DROP TABLE "Note2";
ALTER TABLE "new_Note2" RENAME TO "Note2";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "invalidNotesCounter" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("createdAt", "email", "id", "updatedAt") SELECT "createdAt", "email", "id", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
