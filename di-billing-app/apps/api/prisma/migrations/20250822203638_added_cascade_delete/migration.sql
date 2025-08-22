-- DropForeignKey
ALTER TABLE "public"."GMInvoiceLine" DROP CONSTRAINT "GMInvoiceLine_invoiceId_fkey";

-- AddForeignKey
ALTER TABLE "public"."GMInvoiceLine" ADD CONSTRAINT "GMInvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."GMInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
