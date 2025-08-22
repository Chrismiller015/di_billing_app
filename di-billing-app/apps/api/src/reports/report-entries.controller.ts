import { Controller, Patch, Delete, Param, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ReportEntriesService } from './report-entries.service';
import { UpdateReportEntryDto } from './dto/update-report-entry.dto';

@Controller('reports/entries')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ReportEntriesController {
  constructor(private readonly reportEntriesService: ReportEntriesService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportEntryDto: UpdateReportEntryDto) {
    return this.reportEntriesService.update(id, updateReportEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportEntriesService.remove(id);
  }
}
// --- END OF FILE ---