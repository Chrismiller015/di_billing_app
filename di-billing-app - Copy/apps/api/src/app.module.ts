import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { UploadsModule } from "./uploads/uploads.module";
import { DiscrepanciesModule } from "./discrepancies/discrepancies.module";
import { ReportsModule } from "./reports/reports.module";
import { MappingsModule } from "./mappings/mappings.module";

@Module({
imports: [
ConfigModule.forRoot({ isGlobal: true }),
PrismaModule,
UploadsModule,
DiscrepanciesModule,
ReportsModule,
MappingsModule,
],
})
export class AppModule {}
