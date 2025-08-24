// [SOURCE: apps/api/src/app.module.ts]
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { UploadsModule } from './uploads/uploads.module';
import { DiscrepanciesModule } from './discrepancies/discrepancies.module';
import { ReportsModule } from './reports/reports.module';
import { MappingsModule } from './mappings/mappings.module';
// This path is now corrected to be absolute from the src directory
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'web', 'dist'),
    }),
    PrismaModule,
    UploadsModule,
    DiscrepanciesModule,
    ReportsModule,
    MappingsModule,
    DashboardModule,
  ],
})
export class AppModule {}