import { ApiProperty } from "@nestjs/swagger";

import { EarthquakeResponseDto } from "@/modules/earthquakes/dto/earthquake-response.dto";

export class MapResponseDto {
  @ApiProperty({ type: [EarthquakeResponseDto] })
  data!: EarthquakeResponseDto[];

  @ApiProperty({ example: 5000 })
  total!: number;

  @ApiProperty({ example: 1000 })
  limit!: number;
}
