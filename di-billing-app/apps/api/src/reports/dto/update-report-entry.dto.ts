import { IsString, IsOptional } from 'class-validator';

export class UpdateReportEntryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
// --- END OF FILE ---