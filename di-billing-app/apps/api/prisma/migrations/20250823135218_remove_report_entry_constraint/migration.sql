-- DropIndex
DROP INDEX "public"."ReportEntry_reportId_discrepancyId_key";

-- AlterTable
ALTER TABLE "public"."Discrepancy" ADD COLUMN     "accountCount" INTEGER NOT NULL DEFAULT 1;
