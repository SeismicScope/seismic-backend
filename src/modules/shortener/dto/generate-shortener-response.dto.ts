import { ApiProperty } from "@nestjs/swagger";
import { IsUrl } from "class-validator";

export class GenerateShortenerResponseDto {
  @ApiProperty({ example: "https://example.com/very/long/url" })
  @IsUrl()
  url!: string;
}
