import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { Program } from "@prisma/client";

@Injectable()
export class UploadsService {
private readonly logger = new Logger(UploadsService.name);
constructor(private readonly db: PrismaService) {}

async list() {
return this.db.gMInvoice.findMany({
orderBy: { createdAt: 'desc' },
include: { _count: { select: { lines: true } } }
});
}

async handleInvoiceUpload(
filePath: string,
originalName: string,
program: string,
period: string
) {
fs.mkdirSync(path.dirname(filePath), { recursive: true });
const buf = fs.readFileSync(filePath);
const wb = XLSX.read(buf, { type: "buffer" });
const sheetName = wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
defval: null,
});
const inv = await this.db.gMInvoice.create({
data: { program: program as Program, period, fileName: originalName, current: true },
});
const toInt = (v: any) => {
const n = Number(v);
if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
return n;
};

const linesToCreate = [];
for (const r of rows as any[]) {
  const bac = String(r.BAC ?? r.bac ?? r["Dealer BAC"] ?? "")
    .replace(/\D+/g, "")
    .padStart(6, "0")
    .slice(-6);
  const qty = toInt(r.Qty ?? r.Quantity ?? 1) ?? 1;
  const unit = toInt(r.Unit_Price ?? r.UnitPrice ?? r.Price ?? r.Amount ?? r['Dealer Cost']);
  const code = String(r.Product_Code__c ?? r.Code ?? r.ProductCode ?? "").trim();
  const name = String(r.Product_Name ?? r.Name ?? r['Product Selection'] ?? "").trim();
  if (bac && unit != null) {
    linesToCreate.push({
      invoiceId: inv.id,
      bac,
      productCode: code || "UNKNOWN",
      name,
      qty,
      unitPrice: unit,
    });
  }
}

if (linesToCreate.length > 0) {
  await this.db.gMInvoiceLine.createMany({ data: linesToCreate });
}

await this.db.gMInvoice.updateMany({
  where: { program: inv.program, period: inv.period, NOT: { id: inv.id } },
  data: { current: false },
});
this.logger.log(`Parsed invoice ${originalName}: ${rows.length} rows`);
fs.unlinkSync(filePath); // Clean up uploaded file
return { id: inv.id, rows: rows.length };

}
}
