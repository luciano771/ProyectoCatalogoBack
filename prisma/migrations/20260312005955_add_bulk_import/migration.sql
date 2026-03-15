-- CreateTable
CREATE TABLE "BulkImport" (
    "id" TEXT NOT NULL,
    "merchantProfileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileContent" BYTEA,
    "rowsTotal" INTEGER NOT NULL,
    "rowsCreated" INTEGER NOT NULL,
    "errorsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BulkImport_merchantProfileId_idx" ON "BulkImport"("merchantProfileId");

-- CreateIndex
CREATE INDEX "BulkImport_createdAt_idx" ON "BulkImport"("createdAt");

-- AddForeignKey
ALTER TABLE "BulkImport" ADD CONSTRAINT "BulkImport_merchantProfileId_fkey" FOREIGN KEY ("merchantProfileId") REFERENCES "MerchantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
