-- CreateEnum
CREATE TYPE "public"."Program" AS ENUM ('WEBSITE', 'CHAT', 'TRADE');

-- CreateEnum
CREATE TYPE "public"."DiscrepancyStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "sfid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bac" CHAR(6) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL,
    "isChevy" BOOLEAN NOT NULL DEFAULT false,
    "isGmc" BOOLEAN NOT NULL DEFAULT false,
    "isBuick" BOOLEAN NOT NULL DEFAULT false,
    "isCadillac" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "program" "public"."Program" NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "isLive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pricing" (
    "productCode" TEXT NOT NULL,
    "canonical" TEXT NOT NULL,
    "program" "public"."Program" NOT NULL,
    "standardPrice" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("productCode")
);

-- CreateTable
CREATE TABLE "public"."GMInvoice" (
    "id" TEXT NOT NULL,
    "program" "public"."Program" NOT NULL,
    "period" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GMInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GMInvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "bac" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,

    CONSTRAINT "GMInvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Discrepancy" (
    "id" TEXT NOT NULL,
    "bac" TEXT NOT NULL,
    "program" "public"."Program" NOT NULL,
    "period" TEXT NOT NULL,
    "sfTotal" INTEGER NOT NULL,
    "gmTotal" INTEGER NOT NULL,
    "variance" INTEGER NOT NULL,
    "status" "public"."DiscrepancyStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discrepancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "program" "public"."Program" NOT NULL,
    "period" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportEntry" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "discrepancyId" TEXT NOT NULL,
    "category" TEXT,
    "notes" TEXT,

    CONSTRAINT "ReportEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_sfid_key" ON "public"."Account"("sfid");

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GMInvoiceLine" ADD CONSTRAINT "GMInvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."GMInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportEntry" ADD CONSTRAINT "ReportEntry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
