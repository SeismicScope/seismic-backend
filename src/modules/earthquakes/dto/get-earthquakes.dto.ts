import { Type } from "class-transformer";
import {
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

import { DEFAULT_EARTHQUAKE_LIMIT } from "@/constants";

export const SORT_OPTIONS = [
  "date_asc",
  "date_desc",
  "magnitude_asc",
  "magnitude_desc",
  "depth_asc",
  "depth_desc",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

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
  @IsString()
  @IsIn(SORT_OPTIONS)
  sort?: SortOption;

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
