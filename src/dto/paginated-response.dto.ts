import { ApiProperty } from "@nestjs/swagger";

export class PaginatedResponseDto<T> {
  @ApiProperty()
  data!: T[];

  @ApiProperty({ example: 1000 })
  total!: number;

  @ApiProperty({ example: 42, nullable: true })
  nextCursor!: number | null;
}
