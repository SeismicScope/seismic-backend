import { Type } from "class-transformer";
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

import { DEFAULT_EARTHQUAKE_LIMIT, SORT_OPTIONS } from "@/constants";
import { BaseEarthquakeFilterDto } from "@/dto/base-earthquake-filter.dto";

export type SortOption = (typeof SORT_OPTIONS)[number];

export class GetEarthquakesDto extends BaseEarthquakeFilterDto {
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
  west?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  east?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  north?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  south?: number;
}
