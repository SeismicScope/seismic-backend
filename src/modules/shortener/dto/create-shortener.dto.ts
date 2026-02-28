import { Type } from "class-transformer";
import { IsDefined, IsString } from "class-validator";

export class CreateShortenerDto {
  @IsDefined({ message: "URL is required" })
  @Type(() => String)
  @IsString()
  url!: string;
}
