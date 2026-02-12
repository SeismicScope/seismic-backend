import { IsIn, IsOptional, IsString } from "class-validator";

import { BaseEarthquakeFilterDto } from "@/dto/base-earthquake-filter.dto";

export const TIME_INTERVALS = ["day", "week", "month", "year"] as const;
export type TimeInterval = (typeof TIME_INTERVALS)[number];

export class TimeSeriesDto extends BaseEarthquakeFilterDto {
  @IsOptional()
  @IsString()
  @IsIn(TIME_INTERVALS)
  interval: TimeInterval = "month";
}
