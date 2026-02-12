import { ApiProperty } from "@nestjs/swagger";

export class TimeSeriesPointDto {
  @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
  date!: Date;

  @ApiProperty({ example: 150 })
  count!: number;
}

export class StatsResponseDto {
  @ApiProperty({ example: 85000 })
  totalEvents!: number;

  @ApiProperty({ example: 9.1 })
  maxMagnitude!: number;

  @ApiProperty({ example: 4.52 })
  avgMagnitude!: number;

  @ApiProperty({ example: 35.17 })
  avgDepth!: number;
}

export class HistogramPointDto {
  @ApiProperty({ example: 4.5 })
  magnitude!: number;

  @ApiProperty({ example: 320 })
  count!: number;
}
