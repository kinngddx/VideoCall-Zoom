-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SessionEventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionEventLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SessionEventLog" ("actor", "details", "eventType", "id", "sessionId", "timestamp") SELECT "actor", "details", "eventType", "id", "sessionId", "timestamp" FROM "SessionEventLog";
DROP TABLE "SessionEventLog";
ALTER TABLE "new_SessionEventLog" RENAME TO "SessionEventLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
