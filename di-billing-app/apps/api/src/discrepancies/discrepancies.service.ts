// [SOURCE: apps/api/src/discrepancies/discrepancies.service.ts]
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Program } from "@prisma/client";
import { ListDiscrepanciesQueryDto } from "./dto/list-discrepancies.dto";

@Injectable()
export class DiscrepanciesService {
  private readonly logger = new Logger(DiscrepanciesService.name);
  constructor(private readonly db: PrismaService) {}

  async list(query: ListDiscrepanciesQueryDto) {
    const { program, period, status, bac, page, pageSize, sortBy, sortOrder } = query;
    
    const where: any = {};
    if (program && program !== 'undefined') where.program = program as Program;
    if (period && period !== 'undefined') where.period = period;
    if (status && status !== 'undefined') where.status = status as any;
    if (bac && bac !== 'undefined') where.bac = { contains: bac, mode: 'insensitive' };

    const validSortKeys = ['bac', 'sfName', 'sfTotal', 'gmTotal', 'variance', 'status', 'updatedAt'];
    const orderBy = validSortKeys.includes(sortBy) && sortOrder ? { [sortBy]: sortOrder } : { variance: 'desc' };

    const [rows, total] = await this.db.$transaction([
      this.db.discrepancy.findMany({
        where,
        select: {
            id: true,
            bac: true,
            sfName: true,
            accountCount: true,
            program: true,
            period: true,
            sfTotal: true,
            gmTotal: true,
            variance: true,
            status: true,
            updatedAt: true,
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.discrepancy.count({ where }),
    ]);
    return { rows, total, page, pageSize };
  }
  
  // This is the fix: The method now looks up the discrepancy by its unique ID first.
  async getDetails(id: string) {
    const discrepancy = await this.db.discrepancy.findUnique({ where: { id } });

    if (!discrepancy) {
      throw new NotFoundException(`Discrepancy with ID ${id} not found.`);
    }
    const { bac, program, period } = discrepancy;

    const sfLines = await this.db.subscription.findMany({
      where: {
        account: { bac },
        program: program as Program,
        isLive: true,
      },
      select: { 
        productCode: true, 
        unitPrice: true, 
        qty: true,
        account: { select: { name: true } }
      },
      orderBy: { unitPrice: 'desc' }
    });

    const gmInvoice = await this.db.gMInvoice.findFirst({
      where: { program: program as Program, period, current: true }
    });

    let gmLines = [];
    if (gmInvoice) {
      gmLines = await this.db.gMInvoiceLine.findMany({
        where: { invoiceId: gmInvoice.id, bac },
        select: { productCode: true, name: true, unitPrice: true, qty: true },
        orderBy: { unitPrice: 'desc' }
      });
    }
    // The return object now includes the discrepancy itself, which the frontend needs.
    return { discrepancy, sfLines, gmLines };
  }

  async recalculate(program: string, period: string) {
    this.logger.log(`Recalculating discrepancies for Program: "${program}", Period: "${period}"`);
    
    const subscriptions = await this.db.subscription.findMany({
      where: { program: program as Program, isLive: true },
      select: {
        unitPrice: true,
        qty: true,
        account: { select: { bac: true, name: true, sfid: true, isPrimary: true } },
      },
    });

    const sfByBac = new Map<string, { total: number; accounts: { sfid: string; name: string; isPrimary: boolean }[] }>();
    for (const sub of subscriptions) {
      const total = sub.unitPrice * sub.qty;
      const bac = sub.account.bac;
      const accInfo = {
        sfid: sub.account.sfid,
        name: sub.account.name,
        isPrimary: sub.account.isPrimary,
      };
      const current = sfByBac.get(bac) || { total: 0, accounts: [] };
      current.total += total;
      if (!current.accounts.find(a => a.sfid === accInfo.sfid)) {
        current.accounts.push(accInfo);
      }
      sfByBac.set(bac, current);
    }

    const invoice = await this.db.gMInvoice.findFirst({
      where: { program: program as Program, period, current: true },
      include: { lines: true },
    });
    
    if (invoice) {
        this.logger.log(`Found a matching GM Invoice (ID: ${invoice.id}, File: ${invoice.fileName}) with ${invoice.lines.length} lines.`);
    } else {
        this.logger.warn(`No matching GM Invoice found for Program "${program}" and Period "${period}" with current=true.`);
    }
    
    const gmByBac = new Map<string, number>();
    if (invoice) {
      for (const line of invoice.lines) {
        gmByBac.set(
          line.bac,
          (gmByBac.get(line.bac) || 0) + line.unitPrice * line.qty
        );
      }
    }

    const allBacs = new Set<string>([...sfByBac.keys(), ...gmByBac.keys()]);
    const rows = [];
    for (const bac of allBacs) {
      const sfData = sfByBac.get(bac) || { total: 0, accounts: [] };
      const gmTotal = gmByBac.get(bac) || 0;
      const variance = sfData.total - gmTotal;
      if (Math.abs(variance) > 0.01) {
        rows.push({
          bac,
          program: program as Program,
          period,
          sfName: sfData.accounts.map(a => a.name).join(', '),
          accountCount: sfData.accounts.length,
          sfTotal: sfData.total,
          gmTotal,
          variance,
        });
      }
    }

    await this.db.discrepancy.deleteMany({
      where: { program: program as Program, period },
    });
    if (rows.length) await this.db.discrepancy.createMany({ data: rows });
    return { inserted: rows.length };
  }

  async getAccountsByBac(bac: string) {
    return this.db.account.findMany({
      where: { bac },
      select: { sfid: true, name: true, isPrimary: true },
    });
  }
}