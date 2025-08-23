// [SOURCE: apps/api/src/reports/reports.service.ts]
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReportDto } from "./dto/create-report.dto";
import * as XLSX from 'xlsx';
import { Program } from "@prisma/client";

@Injectable()
export class ReportsService {
  constructor(private readonly db: PrismaService) {}

  create(createReportDto: CreateReportDto, createdBy: string) {
    return this.db.report.create({
      data: {
        ...createReportDto,
        program: createReportDto.program as Program,
        createdBy,
      }
    });
  }

  async list() {
    return this.db.report.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { entries: true }}}
    });
  }

  async findByPeriod(program: string, period: string) {
    return this.db.report.findFirst({
      where: { program: program as Program, period },
      include: {
        entries: {
          include: {
            discrepancy: true,
          },
          orderBy: {
            discrepancy: {
              variance: 'desc'
            }
          }
        }
      }
    });
  }

  async addEntries(reportId: string, entries: any[]) {
    const dataToCreate = entries.map(entry => ({
      reportId,
      discrepancyId: entry.discrepancyId,
      specificAccountName: entry.specificAccountName,
      specificSalesforceId: entry.specificSalesforceId,
      isPrimary: entry.isPrimary,
    }));
  
    return this.db.reportEntry.createMany({
      data: dataToCreate,
    });
  }
  
  async clearReportEntries(reportId: string) {
    const report = await this.db.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException(`Report with ID "${reportId}" not found`);
    }
    await this.db.reportEntry.deleteMany({
      where: { reportId },
    });
    return { message: "Report cleared successfully." };
  }

  async deleteReport(reportId: string) {
    const report = await this.db.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException(`Report with ID "${reportId}" not found`);
    }
    await this.db.report.delete({
        where: { id: reportId }
    });
    return { message: "Report deleted successfully."}
  }

  async exportReport(reportId: string) {
    const report = await this.db.report.findUnique({
      where: { id: reportId },
      include: {
        entries: {
          include: {
            discrepancy: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID "${reportId}" not found`);
    }

    const dataToExport = report.entries.map(entry => ({
      'BAC': entry.discrepancy.bac,
      'SF_Name': entry.specificAccountName || entry.discrepancy.sfName,
      'SFID': entry.specificSalesforceId,
      'isPrimary': entry.isPrimary ?? 'N/A',
      'SF_Total': entry.discrepancy.sfTotal,
      'GM_Total': entry.discrepancy.gmTotal,
      'Variance': entry.discrepancy.variance,
      'Status': entry.discrepancy.status,
      'Category': entry.category,
      'Notes': entry.notes,
      'Period': entry.discrepancy.period,
      'Program': entry.discrepancy.program,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Discrepancies');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return { buffer, fileName };
  }
}