import { Type } from "class-transformer";
import { IsDefined, IsNumber, IsOptional } from "class-validator";

export class GetMapDto {
  @IsDefined({ message: "West is required" })
  @Type(() => Number)
  @IsNumber()
  west!: number;

  @IsDefined({ message: "South is required" })
  @Type(() => Number)
  @IsNumber()
  south!: number;

  @IsDefined({ message: "East is required" })
  @Type(() => Number)
  @IsNumber()
  east!: number;

  @IsDefined({ message: "North is required" })
  @Type(() => Number)
  @IsNumber()
  north!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  zoom?: number;
}
