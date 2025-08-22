import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class ReportEntryInput {
    @IsString()
    @IsNotEmpty()
    discrepancyId: string;

    @IsOptional()
    @IsString()
    specificAccountName?: string;
    
    @IsOptional()
    isPrimary?: boolean;
}

export class AddEntriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportEntryInput)
  entries: ReportEntryInput[];
}