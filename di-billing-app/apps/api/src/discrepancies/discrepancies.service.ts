// FILE: apps/api/src/discrepancies/discrepancies.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Program } from "@prisma/client";

@Injectable()
export class DiscrepanciesService {
  private readonly logger = new Logger(DiscrepanciesService.name);
  constructor(private readonly db: PrismaService) {}

  async list(q: any) {
    const { program, period, status, bac, page = 1, pageSize = 50 } = q;
    const where: any = {};
    if (program) where.program = program;
    if (period) where.period = period;
    if (status) where.status = status;
    if (bac) where.bac = bac;

    const [rows, total] = await this.db.$transaction([
      this.db.discrepancy.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
      }),
      this.db.discrepancy.count({ where }),
    ]);
    return { rows, total, page: Number(page), pageSize: Number(pageSize) };
  }

  async recalculate(program: string, period: string) {
    this.logger.log(`Recalculating discrepancies for ${program} ${period}`);
    // Aggregate SF subscriptions by BAC via account
    const sfAgg = await this.db.subscription.groupBy({
      by: ["accountId"],
      where: { program: program as Program, isLive: true },
      _sum: { unitPrice: true },
    });
    const accounts = await this.db.account.findMany({
      where: { id: { in: sfAgg.map((a: { accountId: string }) => a.accountId) } },
      select: { id: true, bac: true },
    });
    const sfByBac = new Map<string, number>();
    for (const a of sfAgg) {
      const acc = accounts.find((x: { id: string; bac: string }) => x.id === a.accountId);
      if (!acc) continue;
      const current = sfByBac.get(acc.bac) || 0;
      sfByBac.set(acc.bac, current + (a._sum.unitPrice || 0));
    }

    // Aggregate GM invoice by BAC
    const invoice = await this.db.gMInvoice.findFirst({
      where: { program: program as Program, period, current: true },
      include: { lines: true },
    });
    const gmByBac = new Map<string, number>();
    if (invoice) {
      for (const line of invoice.lines) {
        gmByBac.set(
          line.bac,
          (gmByBac.get(line.bac) || 0) + line.unitPrice * line.qty
        );
      }
    }

    // Merge and upsert discrepancies
    const allBacs = new Set<string>([...sfByBac.keys(), ...gmByBac.keys()]);
    const rows = [];
    for (const bac of allBacs) {
      const sf = sfByBac.get(bac) || 0;
      const gm = gmByBac.get(bac) || 0;
      const variance = sf - gm;
      if (Math.abs(variance) !== 0) {
        rows.push({ bac, program: program as Program, period, sfTotal: sf, gmTotal: gm, variance });
      }
    }

    await this.db.discrepancy.deleteMany({
      where: { program: program as Program, period },
    });
    if (rows.length) await this.db.discrepancy.createMany({ data: rows });
    return { inserted: rows.length };
  }
}