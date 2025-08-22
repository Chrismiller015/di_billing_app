import { Module } from "@nestjs/common";
import { DiscrepanciesService } from "./discrepancies.service";
import { DiscrepanciesController } from "./discrepancies.controller";

@Module({
providers: [DiscrepanciesService],
controllers: [DiscrepanciesController],
exports: [DiscrepanciesService],
})
export class DiscrepanciesModule {}
