import { Type } from "class-transformer";
import { IsDate, IsIn, IsNumber, IsOptional, IsString } from "class-validator";

export const TIME_INTERVALS = ["day", "week", "month", "year"] as const;

export type TimeInterval = (typeof TIME_INTERVALS)[number];

export class TimeSeriesDto {
  @IsOptional()
  @IsString()
  @IsIn(TIME_INTERVALS)
  interval: TimeInterval = "month";

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
