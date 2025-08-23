// [SOURCE: apps/api/src/reports/dto/add-entries.dto.ts]
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class ReportEntryInput {
    @IsString()
    @IsNotEmpty()
    discrepancyId: string;

    @IsOptional()
    @IsString()
    specificAccountName?: string;
    
    // --- CHANGE START ---
    @IsOptional()
    @IsString()
    specificSalesforceId?: string;
    // --- CHANGE END ---

    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;
}

export class AddEntriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportEntryInput)
  entries: ReportEntryInput[];
}