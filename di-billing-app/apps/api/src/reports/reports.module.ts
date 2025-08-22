import { Module } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";
import { ReportEntriesController } from "./report-entries.controller";
import { ReportEntriesService } from "./report-entries.service";

@Module({
  providers: [ReportsService, ReportEntriesService],
  controllers: [ReportsController, ReportEntriesController],
})
export class ReportsModule {}
// --- END OF FILE ---