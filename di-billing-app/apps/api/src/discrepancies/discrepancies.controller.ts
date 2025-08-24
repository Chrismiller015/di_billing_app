// [SOURCE: apps/api/src/discrepancies/discrepancies.controller.ts]
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

  // This is the fix: The route now correctly uses the unique 'id'.
  @Get(':id/details')
  async getDetails(@Param('id') id: string) {
    // We now pass the unique ID to the service.
    return this.svc.getDetails(id);
  }

  @Post("recalculate")
  async recalc(@Body() body: { program: string; period: string }) {
    return this.svc.recalculate(body.program, body.period);
  }
}