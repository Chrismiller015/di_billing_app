import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateReportEntryDto } from './dto/update-report-entry.dto';

@Injectable()
export class ReportEntriesService {
  constructor(private readonly db: PrismaService) {}

  async update(id: string, updateReportEntryDto: UpdateReportEntryDto) {
    try {
      return await this.db.reportEntry.update({
        where: { id },
        data: updateReportEntryDto,
      });
    } catch (error) {
      throw new NotFoundException(`Report entry with ID "${id}" not found.`);
    }
  }

  async remove(id: string) {
    try {
      return await this.db.reportEntry.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Report entry with ID "${id}" not found.`);
    }
  }
}
// --- END OF FILE ---