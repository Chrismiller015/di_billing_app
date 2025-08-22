import { Controller, Get, Post, Query, Body } from "@nestjs/common";
import { DiscrepanciesService } from "./discrepancies.service";

@Controller("discrepancies")
export class DiscrepanciesController {
constructor(private readonly svc: DiscrepanciesService) {}

@Get()
async list(@Query() q: any) {
return this.svc.list(q);
}

@Post("recalculate")
async recalc(@Body() body: { program: string; period: string }) {
return this.svc.recalculate(body.program, body.period);
}
}
