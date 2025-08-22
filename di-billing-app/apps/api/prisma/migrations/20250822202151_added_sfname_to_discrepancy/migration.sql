/*
  Warnings:

  - A unique constraint covering the columns `[reportId,discrepancyId]` on the table `ReportEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Discrepancy" ADD COLUMN     "sfName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ReportEntry_reportId_discrepancyId_key" ON "public"."ReportEntry"("reportId", "discrepancyId");

-- AddForeignKey
ALTER TABLE "public"."ReportEntry" ADD CONSTRAINT "ReportEntry_discrepancyId_fkey" FOREIGN KEY ("discrepancyId") REFERENCES "public"."Discrepancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
