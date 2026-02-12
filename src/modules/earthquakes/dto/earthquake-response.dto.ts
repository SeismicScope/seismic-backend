import { ApiProperty } from "@nestjs/swagger";

export class EarthquakeResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "2023-01-15T10:30:00.000Z" })
  occurredAt!: Date;

  @ApiProperty({ example: 6.3 })
  magnitude!: number;

  @ApiProperty({ example: 15.0 })
  depth!: number;

  @ApiProperty({ example: 35.05 })
  latitude!: number;

  @ApiProperty({ example: 139.129 })
  longitude!: number;

  @ApiProperty({ example: "Near Tokyo, Japan", nullable: true })
  location!: string | null;
}
