// [SOURCE: apps/api/src/reports/dto/update-report-entry.dto.ts]
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateReportEntryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // --- CHANGE START ---
  @IsOptional()
  @IsString()
  specificAccountName?: string;

  @IsOptional()
  @IsString()
  specificSalesforceId?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
  // --- CHANGE END ---
}