import { Controller, Get, Post, Query, Body, Param, ValidationPipe, UsePipes } from "@nestjs/common";
import { DiscrepanciesService } from "./discrepancies.service";
import { ListDiscrepanciesQueryDto } from "./dto/list-discrepancies.dto";

@Controller("discrepancies")
export class DiscrepanciesController {
  constructor(private readonly svc: DiscrepanciesService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async list(@Query() query: ListDiscrepanciesQueryDto) {
    return this.svc.list(query);
  }

  @Get('accounts-by-bac')
  async getAccountsByBac(@Query('bac') bac: string) {
    return this.svc.getAccountsByBac(bac);
  }

  @Get(':bac/details')
  async getDetails(
    @Param('bac') bac: string,
    @Query('program') program: string,
    @Query('period') period: string,
  ) {
    return this.svc.getDetails(bac, program, period);
  }

  @Post("recalculate")
  async recalc(@Body() body: { program: string; period: string }) {
    return this.svc.recalculate(body.program, body.period);
  }
}