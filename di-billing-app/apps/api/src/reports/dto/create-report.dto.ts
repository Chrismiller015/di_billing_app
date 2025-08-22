import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  program: string;

  @IsString()
  @IsNotEmpty()
  period: string;
}