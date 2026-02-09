import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional, Max, Min } from "class-validator";

import { DEFAULT_EARTHQUAKE_LIMIT } from "@/constants";

export class GetEarthquakesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cursor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = DEFAULT_EARTHQUAKE_LIMIT;

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
