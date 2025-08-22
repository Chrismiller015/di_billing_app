import { Controller, Get, Post, Body, Param, Res, UsePipes, ValidationPipe, Query } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { AddEntriesDto } from "./dto/add-entries.dto";
import type { Response } from 'express';

@Controller("reports")
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.svc.create(createReportDto, 'system.user');
  }

  @Get()
  list() {
    return this.svc.list();
  }

  @Get('by-period')
  findByPeriod(@Query('program') program: string, @Query('period') period: string) {
    return this.svc.findByPeriod(program, period);
  }

  @Post(':id/entries')
  addEntries(@Param('id') id: string, @Body() addEntriesDto: AddEntriesDto) {
    return this.svc.addEntries(id, addEntriesDto.discrepancyIds);
  }

  @Get(':id/export')
  async exportReport(@Param('id') id: string, @Res() res: Response) {
    const { buffer, fileName } = await this.svc.exportReport(id);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  }
}