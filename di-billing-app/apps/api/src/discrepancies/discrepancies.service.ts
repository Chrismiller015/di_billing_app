import { Injectable, Logger } from "@nestjs/common";
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
    if (program) where.program = program as Program;
    if (period) where.period = period;
    if (status) where.status = status as any;
    if (bac) where.bac = { contains: bac, mode: 'insensitive' };

    const validSortKeys = ['bac', 'sfName', 'sfTotal', 'gmTotal', 'variance', 'status', 'updatedAt'];
    const orderBy = validSortKeys.includes(sortBy) && sortOrder ? { [sortBy]: sortOrder } : { variance: 'desc' };

    const [rows, total] = await this.db.$transaction([
      this.db.discrepancy.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.discrepancy.count({ where }),
    ]);
    return { rows, total, page, pageSize };
  }
  
  async recalculate(program: string, period: string) {
    this.logger.log(`Recalculating discrepancies for Program: "${program}", Period: "${period}"`);
    
    const sfAgg = await this.db.subscription.groupBy({
      by: ["accountId"],
      where: { program: program as Program, isLive: true },
      _sum: { unitPrice: true },
    });
    
    const accountIds = sfAgg.map((a) => a.accountId);
    const accounts = await this.db.account.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, bac: true, name: true },
    });
    
    const bacToNames = new Map<string, string[]>();
    for (const acc of accounts) {
        if (!bacToNames.has(acc.bac)) {
            bacToNames.set(acc.bac, []);
        }
        bacToNames.get(acc.bac)!.push(acc.name);
    }

    const sfByBac = new Map<string, { total: number; name: string }>();
    for (const a of sfAgg) {
      const acc = accounts.find((x) => x.id === a.accountId);
      if (!acc) continue;
      
      const names = bacToNames.get(acc.bac) || [];
      const uniqueNames = Array.from(new Set(names)).join(', ');

      const current = sfByBac.get(acc.bac) || { total: 0, name: uniqueNames };
      sfByBac.set(acc.bac, {
        total: current.total + (a._sum.unitPrice || 0),
        name: uniqueNames,
      });
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
      const sfData = sfByBac.get(bac) || { total: 0, name: null };
      const gmTotal = gmByBac.get(bac) || 0;
      const variance = sfData.total - gmTotal;
      if (Math.abs(variance) > 0.01) {
        rows.push({
          bac,
          program: program as Program,
          period,
          sfName: sfData.name,
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
      select: { name: true, isPrimary: true },
    });
  }

  async getDetails(bac: string, program: string, period: string) {
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

    return { sfLines, gmLines };
  }
}
// --- END OF FILE ---