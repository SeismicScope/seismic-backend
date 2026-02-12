import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional } from "class-validator";

export class BaseEarthquakeFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minMag?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxMag?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minDepth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDepth?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;
}
