import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse';
import { Program } from "@prisma/client";

function normalizeBac(input: string | number): string {
  const digits = String(input ?? "").replace(/\D+/g, "");
  return digits.padStart(6, "0").slice(-6);
}

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

  async deleteInvoice(id: string) {
    const invoice = await this.db.gMInvoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }
    return this.db.gMInvoice.delete({ where: { id } });
  }

  async handleInvoiceUpload(
    filePath: string,
    originalName: string,
    program: string,
    period: string
  ) {
    fs.mkdirSync(path.resolve('uploads'), { recursive: true });
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
      const code = String(r['Product Code'] ?? r.Product_Code__c ?? r.Code ?? r.ProductCode ?? "").trim();
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
    fs.unlinkSync(filePath);
    return { id: inv.id, rows: rows.length };
  }

  async handleSubscriptionsUpload(filePath: string) {
    this.logger.log(`Parsing subscriptions from ${filePath}`);
    const fileContent = fs.readFileSync(filePath);
    const accounts = await this.db.account.findMany({ select: { id: true, sfid: true } });
    const accountMap = new Map(accounts.map(a => [a.sfid, a.id]));
    const mappings = await this.db.pricing.findMany({ select: { canonical: true, productCode: true, program: true } });
    const mappingMap = new Map(mappings.map(m => [m.canonical, { productCode: m.productCode, program: m.program }]));
    const subscriptionsToCreate = [];
    let errorCount = 0;
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    for await (const record of parser) {
      const accountId = accountMap.get(record.SBQQ__Account__c);
      const mapping = mappingMap.get(record.DI_Brand_Name__c);
      if (!accountId || !mapping) {
        errorCount++;
        continue;
      }
      subscriptionsToCreate.push({
        accountId,
        productCode: mapping.productCode,
        program: mapping.program,
        unitPrice: parseInt(record.Dealer_Price__c, 10) || 0,
        qty: 1,
        isLive: record.Is_Live__c?.toLowerCase() === 'true',
      });
    }
    if (subscriptionsToCreate.length > 0) {
      await this.db.subscription.deleteMany({});
      await this.db.subscription.createMany({ data: subscriptionsToCreate });
    }
    fs.unlinkSync(filePath);
    this.logger.log(`Finished processing subscriptions. Created: ${subscriptionsToCreate.length}, Skipped: ${errorCount}`);
    return { created: subscriptionsToCreate.length, skipped: errorCount };
  }

  async handleAccountsUpload(filePath: string) {
    this.logger.log(`Parsing accounts from ${filePath}`);
    const fileContent = fs.readFileSync(filePath);
    const accountsToCreate = [];
    let errorCount = 0;
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    for await (const record of parser) {
      if (!record.Account_ID__c || !record.Name || !record.BAC_Code__c) {
        errorCount++;
        continue;
      }
      accountsToCreate.push({
        sfid: record.Account_ID__c,
        name: record.Name,
        bac: normalizeBac(record.BAC_Code__c),
        isPrimary: record.isPrimary?.toLowerCase() === 'true' || true,
        isChevy: record.OEM__c?.includes('Chevrolet') || false,
        isGmc: record.OEM__c?.includes('GMC') || false,
        isBuick: record.OEM__c?.includes('Buick') || false,
        isCadillac: record.OEM__c?.includes('Cadillac') || false,
      });
    }
    if (accountsToCreate.length > 0) {
      await this.db.account.deleteMany({});
      await this.db.account.createMany({ data: accountsToCreate });
    }
    fs.unlinkSync(filePath);
    this.logger.log(`Finished processing accounts. Created: ${accountsToCreate.length}, Skipped: ${errorCount}`);
    return { created: accountsToCreate.length, skipped: errorCount };
  }
  
  async handlePricingUpload(filePath: string) {
    this.logger.log(`Parsing pricing table from ${filePath}`);
    const fileContent = fs.readFileSync(filePath);
    const recordsMap = new Map();
    let errorCount = 0;
    const validPrograms = new Set(Object.values(Program));
    const programMap = { 'WEB': Program.WEBSITE, 'CHAT': Program.CHAT, 'TRADE': Program.TRADE };
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    for await (const record of parser) {
      let programValue = record['GM Program']?.toUpperCase();
      if (programMap[programValue]) {
        programValue = programMap[programValue];
      }
      const priceString = (record['Dealer Price'] || '0').replace(/[^0-9.-]+/g,"");
      const price = parseInt(priceString, 10);
      let productCode = record['Product Code'];
      const websiteTier = record['Website Tier'];
      if (!productCode || !record['DI Brand Name'] || !programValue || isNaN(price) || !validPrograms.has(programValue)) {
        errorCount++;
        continue;
      }
      if (websiteTier && websiteTier.trim() !== '') {
        productCode = `${productCode}-${websiteTier.trim()}`;
      }
      recordsMap.set(productCode, {
        productCode: productCode,
        canonical: record['DI Brand Name'],
        program: programValue,
        standardPrice: price,
        active: record['Active']?.toLowerCase() === 'y',
      });
    }
    const recordsToCreate = Array.from(recordsMap.values());
    if (recordsToCreate.length > 0) {
      await this.db.pricing.deleteMany({});
      await this.db.pricing.createMany({ data: recordsToCreate });
    }
    fs.unlinkSync(filePath);
    this.logger.log(`Finished processing pricing. Created: ${recordsToCreate.length}, Skipped: ${errorCount}`);
    return { created: recordsToCreate.length, skipped: errorCount };
  }
}