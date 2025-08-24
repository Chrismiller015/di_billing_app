// [SOURCE: apps/api/src/dashboard/dashboard.service.ts]
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscrepancyStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly db: PrismaService) {}

  async getStats() {
    const totalDiscrepancies = await this.db.discrepancy.count();
    const totalVariance = await this.db.discrepancy.aggregate({
      _sum: {
        variance: true,
      },
    });

    const statusCounts = await this.db.discrepancy.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const recentInvoices = await this.db.gMInvoice.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const recentReports = await this.db.report.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: { entries: true }
            }
        }
    });

    return {
      totalDiscrepancies,
      totalVariance: totalVariance._sum.variance || 0,
      statusCounts: {
        open: statusCounts.find(s => s.status === DiscrepancyStatus.OPEN)?._count.status || 0,
        inReview: statusCounts.find(s => s.status === DiscrepancyStatus.IN_REVIEW)?._count.status || 0,
        resolved: statusCounts.find(s => s.status === DiscrepancyStatus.RESOLVED)?._count.status || 0,
      },
      recentInvoices,
      recentReports
    };
  }
}